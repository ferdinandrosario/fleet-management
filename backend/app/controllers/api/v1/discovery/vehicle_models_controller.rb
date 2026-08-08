# frozen_string_literal: true

module Api
  module V1
    module Discovery
      class VehicleModelsController < ApplicationController
        def index
          skip_authorization
          scope = VehicleModel.where(active: true)
          scope = scope.where(category: params[:category]) if params[:category].present?
          scope = scope.where(make: params[:make]) if params[:make].present?

          render_success(
            data: {
              vehicle_models: scope.map { |vm| VehicleModelSerializer.call(vm) }
            }
          )
        end
      end
    end
  end
end
