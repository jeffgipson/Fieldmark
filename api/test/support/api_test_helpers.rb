# frozen_string_literal: true

module ApiTestHelpers
  def api_headers(token = nil)
    headers = {
      "Accept" => "application/json",
      "Content-Type" => "application/json"
    }
    headers["Authorization"] = "Bearer #{token}" if token.present?
    headers
  end

  def json_body
    JSON.parse(response.body)
  end

  def api_data
    json_body["data"]
  end

  def api_errors
    json_body["errors"] || []
  end

  def assert_api_success(expected_status = :ok)
    assert_response expected_status, -> { "body: #{response.body}" }
    assert_empty api_errors, -> { "errors: #{api_errors.inspect}" }
    assert_not_nil api_data, "expected data envelope"
  end

  def register_user!(email: nil, password: "password123")
    email ||= "test-#{SecureRandom.hex(4)}@fieldmark.test"
    post "/api/v1/auth/register",
         params: {
           user: {
             email: email,
             password: password,
             password_confirmation: password,
             first_name: "Test",
             last_name: "Farmer"
           }
         },
         headers: api_headers,
         as: :json
    assert_api_success(:created)
    { email: email, password: password, token: api_data["token"] }
  end

  def with_stubbed_service(klass, method_name, return_value)
    original = klass.method(method_name)
    klass.define_singleton_method(method_name) { |*_args, **_kwargs| return_value }
    yield
  ensure
    klass.define_singleton_method(method_name, original)
  end

  def login_user!(email:, password: "password123")
    post "/api/v1/auth/login",
         params: { user: { email: email, password: password } },
         headers: api_headers,
         as: :json
    assert_api_success(:ok)
    api_data["token"]
  end
end
