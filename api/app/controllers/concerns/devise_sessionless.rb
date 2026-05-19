# frozen_string_literal: true

module DeviseSessionless
  extend ActiveSupport::Concern

  def sign_in(resource_or_scope, *args)
    options = args.extract_options!
    super(resource_or_scope, *args, **options, store: false)
  end
end
