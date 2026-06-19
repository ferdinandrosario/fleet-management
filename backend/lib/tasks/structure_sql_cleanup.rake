# Post-processes db/structure.sql after every dump so it loads cleanly and
# completely. Two fixes, both regeneration-safe (no hand-editing):
#
# 1. PostgreSQL 15+ pg_dump writes `CREATE SCHEMA public;`, which fails on load
#    because the schema always exists. We make every bare schema create
#    idempotent (also covers re-loads on existing databases).
#
# 2. Rails restricts the structure dump to the search-path schemas (--schema),
#    which makes pg_dump OMIT database-level `CREATE EXTENSION`. PostGIS and
#    btree_gist are required by the schema, so we ensure their (idempotent)
#    creation is present. `WITH SCHEMA public` keeps them out of tenant schemas
#    when ros-apartment loads this file per tenant.
Rake::Task["db:schema:dump"].enhance do
  structure = Rails.root.join("db/structure.sql")
  next unless structure.exist?

  sql = structure.read.gsub(/^CREATE SCHEMA (\w+);$/, 'CREATE SCHEMA IF NOT EXISTS \1;')

  unless sql.include?("CREATE EXTENSION IF NOT EXISTS postgis")
    extensions = "\n" \
      "CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;\n" \
      "CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;\n"
    sql = sql.sub("CREATE SCHEMA IF NOT EXISTS public;\n") { |line| line + extensions }
  end

  structure.write(sql)
end
