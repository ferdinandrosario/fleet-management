class CreateApiDocGrants < ActiveRecord::Migration[8.1]
  def change
    create_table :api_doc_grants do |t|
      t.string :email, null: false
      t.string :token, null: false
      t.datetime :expires_at, null: false

      t.timestamps
    end
    add_index :api_doc_grants, :email
    add_index :api_doc_grants, :token, unique: true
  end
end
