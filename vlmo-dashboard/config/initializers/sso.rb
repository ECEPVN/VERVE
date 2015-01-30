# config/initializers/sso.rb
require 'user'
Bsm::Sso::Client.configure do |c|
  c.site = "https://sso.vervemobile.com"
  c.secret = "Xf28xNCYcwJPtcCxLvw8FF3otWbSbWmEOPiJTUfqkm6oSNwH8yHRKXjthaco"
  c.user_class = ::User
end