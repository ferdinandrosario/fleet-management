# Add company_name and address to owners table (Session 4/10 schema enhancement).
# company_name stores the tenant company name, which is visible only to super admin.
class AddCompanyNameAndAddressToOwners < ActiveRecord::Migration[8.1]
  def change
    add_column :owners, :company_name, :string
    add_column :owners, :address, :text
  end
end
