require "database_cleaner/active_record"

# Per-tenant-aware test cleaning. Most specs run inside a transaction (fast,
# auto-rolled-back). Specs that create or drop tenant schemas (DDL, which a
# transaction can't reliably wrap across Apartment's separate statements) tag
# themselves `:tenant_schema` and use truncation instead; those manage their
# own schema teardown.
RSpec.configure do |config|
  protected_tables = %w[ar_internal_metadata schema_migrations]

  config.before(:suite) do
    DatabaseCleaner.clean_with(:truncation, except: protected_tables)
  end

  config.before(:each) do
    DatabaseCleaner.strategy = :transaction
  end

  config.before(:each, :tenant_schema) do
    DatabaseCleaner.strategy = :truncation, { except: protected_tables }
  end

  config.before(:each) { DatabaseCleaner.start }
  config.after(:each)  { DatabaseCleaner.clean }
end
