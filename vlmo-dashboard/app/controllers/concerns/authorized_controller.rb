class AuthorizedController < InheritedResources::Base
  include Bsm::Sso::Client::AuthorizedController
  self.responder = ::ApplicationResponder
  clear_respond_to
end