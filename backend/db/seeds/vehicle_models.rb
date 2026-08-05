# frozen_string_literal: true

module Seeds
  module VehicleModels
    def self.seed!
      models = [
        { name: "Mahindra 575 DI Tractor", make: "Mahindra", category: :tractor },
        { name: "Mahindra 275 DI TU", make: "Mahindra", category: :tractor },
        { name: "Mahindra YUVO 575 DI", make: "Mahindra", category: :tractor },
        { name: "Mahindra NOVO 605 DI-i", make: "Mahindra", category: :tractor },
        { name: "Mahindra JIVO 245 DI", make: "Mahindra", category: :tractor },
        { name: "Mahindra Arjun 555 DI", make: "Mahindra", category: :tractor },
        { name: "Swaraj 744 FE", make: "Swaraj", category: :tractor },
        { name: "Swaraj 744 XT", make: "Swaraj", category: :tractor },
        { name: "Sonalika DI 745 III", make: "Sonalika", category: :tractor },
        { name: "Escorts Powertrac Euro 50", make: "Escorts", category: :tractor },
        { name: "John Deere 5310", make: "John Deere", category: :tractor },
        { name: "New Holland 3630 TX Plus", make: "New Holland", category: :tractor },
        { name: "Eicher 380", make: "Eicher", category: :tractor },
        { name: "Kubota MU4501", make: "Kubota", category: :tractor },

        { name: "JCB 3DX Backhoe Loader", make: "JCB", category: :jcb },
        { name: "JCB 4DX", make: "JCB", category: :jcb },
        { name: "JCB 3DX Extra", make: "JCB", category: :jcb },

        { name: "Tata Ace Gold", make: "Tata", category: :heavy_vehicle },
        { name: "Ashok Leyland Dost+", make: "Ashok Leyland", category: :heavy_vehicle },
        { name: "Tata Signa 4923.S", make: "Tata", category: :heavy_vehicle },
        { name: "Tata Prima 2825.K", make: "Tata", category: :heavy_vehicle },
        { name: "Ashok Leyland Captain 2518", make: "Ashok Leyland", category: :heavy_vehicle },
        { name: "Ashok Leyland U-4923", make: "Ashok Leyland", category: :heavy_vehicle },
        { name: "Eicher Pro 6025T", make: "Eicher", category: :heavy_vehicle },
        { name: "BharatBenz 2823C", make: "BharatBenz", category: :heavy_vehicle },
        { name: "Tata LPT 1109", make: "Tata", category: :heavy_vehicle },
        { name: "Volvo FMX 460", make: "Volvo", category: :heavy_vehicle },

        { name: "Tata LPO 1618", make: "Tata", category: :bus },
        { name: "Ashok Leyland Viking", make: "Ashok Leyland", category: :bus },

        { name: "ACE FX 150", make: "ACE", category: :crane },
        { name: "Escorts Hydra 14", make: "Escorts", category: :crane },
        { name: "ACE SX 150", make: "ACE", category: :crane },

        { name: "Claas Crop Tiger 40", make: "Claas", category: :harvester },
        { name: "Preet 987", make: "Preet", category: :harvester },
        { name: "Kartar 4000", make: "Kartar", category: :harvester }
      ]

      models.each do |data|
        vm = VehicleModel.find_or_initialize_by(make: data[:make], name: data[:name])
        vm.category = data[:category]
        vm.active = true
        vm.save!
      end
    end
  end
end
