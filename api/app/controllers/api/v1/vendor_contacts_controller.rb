# frozen_string_literal: true

module Api
  module V1
    class VendorContactsController < BaseController
      include VendorJson

      def index
        contacts = current_user.user_vendor_contacts.includes(:vendor).order(created_at: :desc)
        render_success(contacts.map { |c| contact_json(c) })
      end

      def create
        vendor = Vendor.active.find(contact_params[:vendor_id])
        contact = current_user.user_vendor_contacts.find_or_initialize_by(vendor: vendor)
        contact.assign_attributes(contact_params.except(:vendor_id))
        if contact.save
          render_success(contact_json(contact), status: :created)
        else
          render_errors(model_errors(contact), status: :unprocessable_entity)
        end
      end

      def destroy
        contact = current_user.user_vendor_contacts.find(params[:id])
        contact.destroy!
        render_success({ id: contact.id, vendor_id: contact.vendor_id })
      end

      def destroy_by_vendor
        contact = current_user.user_vendor_contacts.find_by!(vendor_id: params[:vendor_id])
        contact.destroy!
        render_success({ id: contact.id, vendor_id: contact.vendor_id })
      end

      private

      def contact_params
        params.require(:vendor_contact).permit(:vendor_id, :notes, :last_contacted_at)
      end

      def contact_json(contact)
        {
          id: contact.id,
          notes: contact.notes,
          last_contacted_at: contact.last_contacted_at,
          favorited: true,
          vendor: vendor_json(contact.vendor, favorited: true)
        }
      end
    end
  end
end
