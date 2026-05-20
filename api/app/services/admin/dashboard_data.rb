# frozen_string_literal: true

module Admin
  class DashboardData
    class << self
      def call
        farmers = User.farmer
        farmer_farms = Farm.farmer_owned

        {
          counts: build_counts(farmers, farmer_farms),
          users_by_role: users_by_role,
          subscriptions: subscription_breakdown,
          farms_by_region: group_counts(farmer_farms, :region),
          farms_by_commodity: group_counts(farmer_farms, :primary_commodity),
          vendors_by_category: group_counts(Vendor.all, :category),
          signups_by_month: signups_by_month(farmers),
          farms_by_month: records_by_month(farmer_farms),
          reports_by_status: group_counts(AnalystReport.all, :status),
          payments: payment_metrics,
          recent_users: recent_users,
          recent_farms: recent_farms
        }
      end

      private

      def build_counts(farmers, farmer_farms)
        {
          users: User.count,
          farmers: farmers.count,
          admins: User.admin.count,
          farms: Farm.count,
          farmer_farms: farmer_farms.count,
          fields: Field.count,
          scenarios: Scenario.count,
          vendors: Vendor.count,
          benchmarks: BenchmarkRegion.count,
          decisions: Decision.count,
          conversations: AnalystConversation.count,
          reports: AnalystReport.count,
          total_acres: farmer_farms.sum(:total_acres).to_f.round(1)
        }
      end

      def users_by_role
        User.group(:role).count.map do |role, count|
          { role: role.to_s, count: count }
        end
      end

      def subscription_breakdown
        User.farmer.group(:subscription_plan, :subscription_status).count.map do |(plan, status), count|
          { plan: plan.to_s, status: status.to_s, count: count }
        end
      end

      def group_counts(relation, column)
        relation.group(column).count.map do |key, count|
          { key: key.to_s, label: key.to_s.humanize, count: count }
        end.sort_by { |row| -row[:count] }
      end

      def signups_by_month(scope)
        records_by_month(scope)
      end

      def records_by_month(scope)
        (0..11).map do |months_back|
          start = months_back.months.ago.beginning_of_month
          finish = start.end_of_month
          count = scope.where(created_at: start..finish).count
          {
            month: start.strftime("%Y-%m"),
            label: start.strftime("%b %Y"),
            count: count
          }
        end.reverse
      end

      def payment_metrics
        stripe = ::Admin::MockStripeDashboard.payment_metrics
        {
          summary: stripe[:summary],
          monthly_revenue: stripe[:monthly_revenue].last(6),
          revenue_by_type: stripe[:revenue_by_type].first(5)
        }
      end

      def recent_users
        User.order(created_at: :desc).limit(5).map do |user|
          {
            id: user.id,
            name: user.display_name,
            email: user.email,
            role: user.role,
            plan: user.subscription_plan,
            created_at: user.created_at.iso8601
          }
        end
      end

      def recent_farms
        Farm.farmer_owned.includes(:user).order(created_at: :desc).limit(5).map do |farm|
          {
            id: farm.id,
            name: farm.name,
            county: farm.county,
            region: farm.region,
            total_acres: farm.total_acres,
            owner_name: farm.user&.display_name,
            created_at: farm.created_at.iso8601
          }
        end
      end
    end
  end
end
