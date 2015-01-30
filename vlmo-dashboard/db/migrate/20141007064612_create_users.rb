class CreateUsers < ActiveRecord::Migration
   def change
    create_table :users do |t|
      t.integer  :account_id
      t.string   :authentication_token
      t.datetime :created_at
      t.string   :email
      t.boolean  :enterprise_access, :null => false, :default => false
      t.string   :kind, :limit => 30
      t.integer  :level, :null => false, :default => 0, :limit => 2
      t.string   :name, :limit => 80
      t.text     :property_ids
      t.text     :publication_ids
      t.text     :roles
      t.datetime :created_at
    end
    add_index :users, :authentication_token
  end
end
