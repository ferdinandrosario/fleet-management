# frozen_string_literal: true

module Seeds
  module SuperAdmins
    def self.seed!
      admin = SuperAdmin.find_or_initialize_by(email: "admin@example.com")
      admin.password = "adminsecret123"
      admin.password_confirmation = "adminsecret123"
      admin.save!

      # Seed 25+ multi-tenant owners for super admin pagination testing
      pro_plan = Plan.find_by(tier: :pro) || Plan.first
      starter_plan = Plan.find_by(tier: :starter) || pro_plan
      enterprise_plan = Plan.find_by(tier: :enterprise) || pro_plan

      tenant_data = [
        { slug: "kaveri_agri", name: "Kaveri Agri & Transport Fleet", owner: "Ramesh Kumar", phone: "+919876543220", plan: enterprise_plan, address: "42 Railway Station Road, Salem, Tamil Nadu" },
        { slug: "kongu_jcb", name: "Kongu Heavy Earthmovers", owner: "Senthil Nathan", phone: "+919876543221", plan: pro_plan, address: "108 Trichy Main Road, Coimbatore, Tamil Nadu" },
        { slug: "vazhai_buses", name: "Vazhai City Transit Buses", owner: "Muthu Vadivel", phone: "+919876543222", plan: starter_plan, address: "15 Bus Stand Highway, Madurai, Tamil Nadu" },
        { slug: "deccan_fleet", name: "Deccan Commercial Carriers", owner: "Vikram Reddy", phone: "+919876543223", plan: pro_plan, address: "88 Tech Park Zone, Hyderabad, Telangana" },
        { slug: "chettinad_earth", name: "Chettinad Earthmovers", owner: "Arunachalam S", phone: "+919876543224", plan: pro_plan, address: "12 Heritage Ring Road, Karaikudi, Tamil Nadu" },
        { slug: "pandyan_logistics", name: "Pandyan Heavy Logistics", owner: "Kannan Pandian", phone: "+919876543225", plan: enterprise_plan, address: "50 Bypass Road, Madurai, Tamil Nadu" },
        { slug: "chola_transports", name: "Chola Express Cargo", owner: "Rajendra Cholan", phone: "+919876543226", plan: pro_plan, address: "77 Temple Street, Thanjavur, Tamil Nadu" },
        { slug: "chitra_harvesters", name: "Chitra Agro Machinery", owner: "Chitra Devi", phone: "+919876543227", plan: starter_plan, address: "24 Paddy Field Lane, Erode, Tamil Nadu" },
        { slug: "madurai_tractors", name: "Madurai Agri Rentals", owner: "Sundaram V", phone: "+919876543228", plan: pro_plan, address: "99 West Tower Street, Madurai, Tamil Nadu" },
        { slug: "salem_cranes", name: "Salem Crane Services", owner: "Ganesan K", phone: "+919876543229", plan: enterprise_plan, address: "31 Steel Plant Road, Salem, Tamil Nadu" },
        { slug: "tirupur_textile_logistics", name: "Tirupur Garment Carriers", owner: "Karthik Raja", phone: "+919876543230", plan: pro_plan, address: "55 Hosiery Hub, Tirupur, Tamil Nadu" },
        { slug: "trichy_earthmovers", name: "Trichy Excavation Works", owner: "Saravanan T", phone: "+919876543231", plan: pro_plan, address: "14 Rockfort Avenue, Trichy, Tamil Nadu" },
        { slug: "tiruvarur_agro", name: "Delta Harvest Equipment", owner: "Manickam P", phone: "+919876543232", plan: starter_plan, address: "88 Canal Road, Tiruvarur, Tamil Nadu" },
        { slug: "vellore_freight", name: "Vellore Fort Logistics", owner: "Venkatesh M", phone: "+919876543233", plan: pro_plan, address: "42 Leather Complex, Vellore, Tamil Nadu" },
        { slug: "kanyakumari_marine", name: "Cape Commercial Heavy", owner: "Xavier Fernando", phone: "+919876543234", plan: enterprise_plan, address: "10 Beach Road, Kanyakumari, Tamil Nadu" },
        { slug: "tuticorin_port_trans", name: "Pearl City Port Fleet", owner: "Anthony Raj", phone: "+919876543235", plan: enterprise_plan, address: "200 Harbor Expressway, Tuticorin, Tamil Nadu" },
        { slug: "dindigul_haulers", name: "Lock City Heavy Transport", owner: "Nagarajan S", phone: "+919876543236", plan: starter_plan, address: "18 Highway Circle, Dindigul, Tamil Nadu" },
        { slug: "hosur_auto_carriers", name: "Hosur Industrial Transit", owner: "Gokul Nath", phone: "+919876543237", plan: pro_plan, address: "5 Auto Sector, Hosur, Tamil Nadu" },
        { slug: "namakkal_truckers", name: "Namakkal Lorry Syndicate", owner: "Periasamy K", phone: "+919876543238", plan: enterprise_plan, address: "1 Transport Nagar, Namakkal, Tamil Nadu" },
        { slug: "karur_textile_transit", name: "Karur Export Carriers", owner: "Subramanian A", phone: "+919876543239", plan: pro_plan, address: "33 Handloom Street, Karur, Tamil Nadu" },
        { slug: "cuddalore_heavy", name: "Coastal Earth Equipment", owner: "Balamurugan R", phone: "+919876543240", plan: starter_plan, address: "12 SIPCOT Industrial Area, Cuddalore, Tamil Nadu" },
        { slug: "thiruvallur_cranes", name: "North Gateway Cranes", owner: "Vijay Kumar", phone: "+919876543241", plan: pro_plan, address: "90 Chennai Outer Ring, Thiruvallur, Tamil Nadu" },
        { slug: "kancheepuram_logistics", name: "Silk City Logistics", owner: "Elumalai M", phone: "+919876543242", plan: starter_plan, address: "45 Weaver Colony, Kancheepuram, Tamil Nadu" },
        { slug: "nagercoil_agri", name: "Kanyakumari Agricultural Fleet", owner: "Biju Nair", phone: "+919876543243", plan: pro_plan, address: "77 Coconut Farm Road, Nagercoil, Tamil Nadu" },
        { slug: "pondicherry_transports", name: "French Coast Commercial Fleet", owner: "Jean Pierre", phone: "+919876543244", plan: enterprise_plan, address: "5 Boulevard Road, Puducherry" }
      ]

      tenant_data.each do |data|
        next if Owner.exists?(slug: data[:slug])

        TenantProvisioningService.call(
          name: data[:slug],
          company_name: data[:name],
          address: data[:address],
          slug: data[:slug],
          plan: data[:plan],
          owner_name: data[:owner],
          owner_phone: data[:phone],
          password: "password123",
          status: :active
        )
      end
    end
  end
end
