class User < ActiveRecord::Base

  # ----> EXTENSIONS
  include Bsm::Model::Deletable
  include Bsm::Sso::Client::Cached::ActiveRecord

  # ----> ASSOCIATIONS
  belongs_to :account

  # ----> VALIDATIONS
  validates :name, length: { maximum: 80 }

  # ----> ATTRIBUTES
  serialize       :property_ids, Array
  serialize       :roles, Array

  # ----> SCOPES
  scope :employees, -> { where(arel_table[:kind].eq('employee')) }
  scope :clients,   -> { includes(:account).references(:account).where(arel_table[:kind].eq('client')).order(Account.arel_table[:company_name], arel_table[:email]) }
  scope :ordered,   -> { order('email') }

  # ----> CLASS METHODS

  # Cache all SSO clients
  def self.sso_cache_clients!
    Bsm::Sso::Client::User.all(params: { only: 'clients' }).each do |resource|
      sso_cache(resource)
    end
  end

  # ----> INSTANCE METHODS

  # @return [Boolean]
  #   Users with a kind of 'employee'
  def employee?
    kind == 'employee'
  end

  # @return [Boolean]
  #   Users with a kind of 'client'
  def client?
    kind == 'client'
  end

  # @return [Boolean]
  #   Users are not deletable
  def deletable?
    false
  end

  # @return [String] the label
  def to_label
    [account.try(:company_name), (employee? ? email : name)].compact.join('/')
  end

  # @return [ActiveRecord::Relation] reports relation
  def reports
    return Report.where(Report.arel_table[:access_scope_id].in([2,3])) if account_id == ( Rails.env == 'beta' ? 334 : 338 )
    client? ? Report.send(report_scope) : Report.all
  end

  # @return [Symbol] Either :publisher or :agency
  def report_scope
    account.present? ? account.class.name.downcase.to_sym : nil
  end

end
