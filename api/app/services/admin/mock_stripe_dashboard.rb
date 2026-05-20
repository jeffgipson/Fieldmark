# frozen_string_literal: true

module Admin
  # Deterministic mock Stripe data for the admin payments dashboard.
  # Uses real User/Vendor records for names; amounts and IDs are simulated.
  class MockStripeDashboard
    FARMER_TYPES = %w[subscription_invoice subscription_renewal refund].freeze
    VENDOR_TYPES = %w[listing_fee sponsored_placement lead_fee revenue_share].freeze
    STATUSES = %w[succeeded succeeded succeeded succeeded pending failed refunded].freeze

    class << self
      def payment_metrics
        transactions = build_transactions
        {
          summary: build_summary(transactions),
          monthly_revenue: build_monthly_revenue(transactions),
          revenue_by_type: build_revenue_by_type(transactions)
        }
      end

      def call
        transactions = build_transactions
        {
          mode: "mock",
          stripe_configured: AppConfig.stripe_secret_key.present?,
          summary: build_summary(transactions),
          monthly_revenue: build_monthly_revenue(transactions),
          revenue_by_type: build_revenue_by_type(transactions),
          subscription_breakdown: build_subscription_breakdown,
          transactions: transactions
        }
      end

      private

      def build_transactions
        rows = []
        rows.concat(farmer_transactions)
        rows.concat(vendor_transactions)
        rows.sort_by { |t| t[:created_at] }.reverse
      end

      def farmer_transactions
        User.where.not(role: :admin).order(:id).limit(200).flat_map.with_index do |user, idx|
          count = 1 + (seeded_rand("farmer-count-#{user.id}", 3))
          count.times.map do |n|
            build_farmer_transaction(user, idx, n)
          end
        end
      end

      def vendor_transactions
        Vendor.order(:id).limit(80).flat_map.with_index do |vendor, idx|
          count = 1 + (seeded_rand("vendor-count-#{vendor.id}", 2))
          count.times.map do |n|
            build_vendor_transaction(vendor, idx, n)
          end
        end
      end

      def build_farmer_transaction(user, user_idx, n)
        plan_key = user.subscription_plan
        plan = SubscriptionPlan.for(plan_key)
        type = FARMER_TYPES[seeded_rand("farmer-type-#{user.id}-#{n}", FARMER_TYPES.size)]
        amount_cents = type == "refund" ? -plan[:price_cents] : plan[:price_cents]
        status = type == "refund" ? "refunded" : STATUSES[seeded_rand("farmer-status-#{user.id}-#{n}", STATUSES.size)]
        created_at = months_ago(seeded_rand("farmer-month-#{user.id}-#{n}", 12), seeded_rand("farmer-day-#{user.id}-#{n}", 28) + 1)

        base_transaction(
          id: "pi_mock_farmer_#{user.id}_#{n}",
          category: "farmer",
          type: type,
          party_id: user.id,
          party_name: [user.first_name, user.last_name].compact.join(" ").presence || user.email,
          party_email: user.email,
          description: farmer_description(type, plan[:name]),
          amount_cents: amount_cents,
          status: status,
          created_at: created_at,
          metadata: {
            plan: plan_key.to_s,
            stripe_customer_id: user.stripe_customer_id,
            stripe_subscription_id: user.stripe_subscription_id
          }
        )
      end

      def build_vendor_transaction(vendor, vendor_idx, n)
        type = VENDOR_TYPES[seeded_rand("vendor-type-#{vendor.id}-#{n}", VENDOR_TYPES.size)]
        tier = vendor.listing_tier
        amount_cents = case type
                       when "lead_fee" then VendorListingPlan::LEAD_REFERRAL_CENTS
                       when "sponsored_placement" then VendorListingPlan::PROMOTIONAL_CENTS[:sponsored_campaign]
                       when "revenue_share" then 15_000 + (seeded_rand("vendor-rev-#{vendor.id}-#{n}", 50) * 500)
                       else VendorListingPlan.effective_listing_cents(vendor)
                       end
        status = STATUSES[seeded_rand("vendor-status-#{vendor.id}-#{n}", STATUSES.size)]
        created_at = months_ago(seeded_rand("vendor-month-#{vendor.id}-#{n}", 12), seeded_rand("vendor-day-#{vendor.id}-#{n}", 28) + 1)

        base_transaction(
          id: "pi_mock_vendor_#{vendor.id}_#{n}",
          category: "vendor",
          type: type,
          party_id: vendor.id,
          party_name: vendor.name,
          party_email: nil,
          description: vendor_description(type, vendor),
          amount_cents: amount_cents,
          status: status,
          created_at: created_at,
          metadata: {
            vendor_category: vendor.category,
            listing_tier: tier,
            sponsored: vendor.sponsored
          }
        )
      end

      def base_transaction(attrs)
        amount = attrs[:amount_cents].abs
        fee_cents = (amount * 0.029).round + 30
        net_cents = attrs[:amount_cents].negative? ? attrs[:amount_cents] + fee_cents : attrs[:amount_cents] - fee_cents

        attrs.merge(
          stripe_id: attrs[:id],
          currency: "usd",
          fee_cents: fee_cents,
          net_cents: net_cents
        )
      end

      def farmer_description(type, plan_name)
        case type
        when "subscription_invoice" then "#{plan_name} plan — monthly invoice"
        when "subscription_renewal" then "#{plan_name} plan — renewal"
        else "#{plan_name} plan — prorated refund"
        end
      end

      def vendor_description(type, vendor)
        case type
        when "listing_fee" then "Directory listing ($#{VendorListingPlan.base_listing_dollars.to_i}/mo) — #{vendor.listing_tier}"
        when "sponsored_placement" then "Sponsored placement — #{vendor.name}"
        when "revenue_share" then "Attributed sales revenue share — #{vendor.name}"
        else "Farmer lead referral fee"
        end
      end

      def build_summary(transactions)
        succeeded = transactions.select { |t| t[:status] == "succeeded" }
        last_30 = transactions.select { |t| t[:created_at] >= 30.days.ago }
        farmer = transactions.select { |t| t[:category] == "farmer" }
        vendor = transactions.select { |t| t[:category] == "vendor" }

        active_subs = User.where.not(role: :admin).where(subscription_status: :active).count
        mrr_cents = User.where.not(role: :admin).where(subscription_status: :active).sum do |u|
          SubscriptionPlan.for(u.subscription_plan)[:price_cents]
        end

        {
          mrr_cents: mrr_cents,
          total_volume_cents_30d: last_30.select { |t| t[:status] == "succeeded" }.sum { |t| t[:amount_cents] },
          transaction_count: transactions.size,
          farmer_transaction_count: farmer.size,
          vendor_transaction_count: vendor.size,
          succeeded_count: succeeded.size,
          failed_payments_30d: last_30.count { |t| t[:status] == "failed" },
          active_subscriptions: active_subs
        }
      end

      def build_monthly_revenue(transactions)
        (0..11).map do |months_back|
          start = months_back.months.ago.beginning_of_month
          finish = start.end_of_month
          in_month = transactions.select { |t| t[:created_at].between?(start, finish) && t[:status] == "succeeded" }
          farmer_cents = in_month.select { |t| t[:category] == "farmer" }.sum { |t| t[:amount_cents] }
          vendor_cents = in_month.select { |t| t[:category] == "vendor" }.sum { |t| t[:amount_cents] }

          {
            month: start.strftime("%Y-%m"),
            label: start.strftime("%b %Y"),
            farmer_cents: farmer_cents,
            vendor_cents: vendor_cents,
            total_cents: farmer_cents + vendor_cents
          }
        end.reverse
      end

      def build_revenue_by_type(transactions)
        transactions
          .select { |t| t[:status] == "succeeded" }
          .group_by { |t| t[:type] }
          .map do |type, rows|
            {
              type: type,
              label: type.humanize,
              count: rows.size,
              amount_cents: rows.sum { |r| r[:amount_cents] }
            }
          end
          .sort_by { |r| -r[:amount_cents] }
      end

      def build_subscription_breakdown
        User.where.not(role: :admin).group(:subscription_plan, :subscription_status).count.map do |(plan, status), count|
          {
            plan: plan.to_s,
            status: status.to_s,
            count: count
          }
        end
      end

      def months_ago(months, day)
        months.months.ago.change(day: [day, 28].min).beginning_of_day + seeded_rand("time-#{months}-#{day}", 86_400).seconds
      end

      def seeded_rand(seed, max)
        return 0 if max <= 0

        Digest::SHA256.hexdigest(seed.to_s)[0, 8].to_i(16) % max
      end
    end
  end
end
