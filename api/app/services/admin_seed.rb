# frozen_string_literal: true

class AdminSeed
  def self.call
    email = AppConfig.admin_email.downcase
    password = ENV.fetch("ADMIN_PASSWORD", AppConfig.demo_password)
    user = User.find_or_initialize_by(email: email)
    user.assign_attributes(
      first_name: "Fieldmark",
      last_name: "Admin",
      role: :admin,
      password: password,
      password_confirmation: password
    )
    user.skip_welcome_email = true
    user.save!
    user
  end
end
