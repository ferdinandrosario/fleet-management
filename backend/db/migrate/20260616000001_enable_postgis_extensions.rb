# Installs PostGIS + btree_gist into the public schema.
#
# Apartment caveat (docs/runbook): PostGIS must live in a schema that
# ros-apartment does NOT recreate per tenant. The public schema is shared and
# persistent (it's in Apartment.persistent_schemas), so the extensions are
# created once here and stay reachable from every tenant via the search path.
# pg_dump writes them as `CREATE EXTENSION IF NOT EXISTS ... WITH SCHEMA public`,
# so a per-tenant structure load is a harmless no-op.
#
# btree_gist is required by the booking double-booking exclusion constraint
# (a GiST index mixing `=` on vehicle_id with `&&` on a tstzrange — Session 6).
class EnablePostgisExtensions < ActiveRecord::Migration[8.1]
  def change
    enable_extension "postgis"
    enable_extension "btree_gist"
  end
end
