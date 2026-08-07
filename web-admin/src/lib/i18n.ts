// English-only i18n support matching backend (en).

export type Locale = 'en';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    app_title: "Fleet Management",
    super_admin_dashboard: "Super Admin Platform Dashboard",
    owner_dashboard: "Fleet Owner Analytics",
    total_revenue: "Total Fleet Revenue",
    completed_jobs: "Completed Jobs",
    active_vehicles: "Active Vehicles",
    active_drivers: "Active Drivers",
    utilization_rate: "Vehicle Utilization Rate",
    average_rating: "Average Fleet Rating",
    mrr: "Monthly Recurring Revenue (MRR)",
    total_owners: "Registered Owners",
    active_subscriptions: "Active Subscriptions",
    export_csv: "Export Bookings CSV",
    switch_tenant: "Switch Tenant Schema",
    login: "Log In",
    logout: "Log Out",
    status_success: "Success",
    status_error: "Error",
    auth_title: "Fleet Portal Sign In",
    auth_subtitle: "Access commercial fleet operations and platform dashboard",
    owner_auth_title: "Fleet Owner Sign In",
    owner_auth_subtitle: "Access commercial fleet operations and bookings",
    superadmin_auth_title: "Super Admin Portal",
    superadmin_auth_subtitle: "Access platform administration and multi-tenant management",
    switch_to_superadmin: "Super Admin? Sign in at /superadmin",
    switch_to_owner: "Fleet Owner? Sign in at Main Portal",
    role_fleet_owner: "Fleet Owner",
    role_super_admin: "Super Admin",
    phone_number: "Phone Number",
    phone_placeholder: "+91 98765 43210",
    email_address: "Email Address",
    email_placeholder: "admin@example.com",
    password: "Password",
    password_placeholder: "••••••••",
    tenant_slug: "Tenant Slug",
    tenant_slug_placeholder: "demo_tenant",
    sign_in: "Sign In",
    signing_in: "Signing In...",
    authenticated_as: "Signed in as",
    login_error_invalid: "Invalid credentials or unauthorized access. Please try again.",
    login_error_required: "Please fill in all required fields.",
    login_success: "Successfully authenticated",
    demo_autofill: "Quick Fill Demo Credentials",
    nav_overview: "Overview",
    nav_fleet: "Fleet Equipment",
    nav_telemetry: "Telemetry & System",
    nav_technical: "Technical Architecture",
    nav_settings: "Settings",
    tenant_label: "Tenant:",
    system_status: "All Systems Operational",
    schema_isolation: "Schema Isolation (ros-apartment)",
    razorpay_integrated: "Razorpay Billing",
    main_portal: "Main Portal",
    demo_portal: "Super Admin /demo Portal",
    platform_footer_desc: "Commercial vehicle booking platform for India (Tractors, JCBs, Earthmovers, Buses).",
    add_vehicle: "Add Vehicle",
    add_new_vehicle: "Add New Vehicle",
    add_vehicle_subtitle: "Register a new tractor, JCB, crane, or commercial vehicle to your fleet",
    vehicle_name: "Vehicle Name",
    vehicle_category: "Category",
    registration_number: "Registration Number",
    model_year: "Model Year",
    hourly_rate: "Hourly Rate (₹/hr)",
    daily_rate: "Daily Rate (₹/day)",
    specifications: "Specifications (JSON)",
    save_vehicle: "Save Vehicle",
    saving_vehicle: "Saving Vehicle...",
    cancel: "Cancel",
    plan_limit_reached: "Plan limit reached! Upgrade your subscription to add more vehicles."
  }
};

let currentLocale: Locale = 'en';

export const setLocale = (loc: Locale) => {
  currentLocale = loc;
};

export const getLocale = (): Locale => currentLocale;

export const t = (key: string): string => {
  return translations[currentLocale]?.[key] || translations['en']?.[key] || key;
};
