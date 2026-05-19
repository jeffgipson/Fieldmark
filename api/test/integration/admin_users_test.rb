require 'test_helper'

class AdminUsersTest < ActionDispatch::IntegrationTest
  setup do
    @admin = users(:admin_user)
    @user = users(:farmer_one)
    @admin_token = login_user!(@admin.email)
    @user_token = login_user!(@user.email)
  end

  test 'admin can list users' do
    get '/api/v1/admin/users', headers: api_headers(@admin_token)
    assert_api_success
    assert_equal User.count, json_body['data'].length
  end

  test 'non-admin cannot list users' do
    get '/api/v1/admin/users', headers: api_headers(@user_token)
    assert_response :forbidden
  end

  test 'admin can update-a-user' do
    patch "/api/v1/admin/users/#{@user.id}", params: { user: { first_name: 'New Name' } }, headers: api_headers(@admin_token), as: :json
    assert_api_success
    assert_equal 'New Name', @user.reload.first_name
  end
end
