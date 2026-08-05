# frozen_string_literal: true

module Api
  module V1
    module SuperAdmin
      class VehicleModelsController < BaseController
        def index
          authorize VehicleModel

          scope = VehicleModel.all.order(:make, :name)
          scope = scope.where(category: params[:category]) if params[:category].present?
          scope = scope.where(make: params[:make]) if params[:make].present?
          scope = scope.where(active: params[:active]) if params[:active].present?

          pagy, vehicle_models = pagy(scope)

          render_success(
            data: {
              vehicle_models: vehicle_models.map do |vm|
                {
                  id: vm.uuid,
                  make: vm.make,
                  name: vm.name,
                  category: vm.category,
                  active: vm.active
                }
              end,
              pagination: {
                page: pagy.page,
                pages: pagy.pages,
                count: pagy.count,
                limit: pagy.limit
              }
            }
          )
        end

        def show
          vehicle_model = VehicleModel.find_by!(uuid: params[:id])
          authorize vehicle_model

          render_success(
            data: {
              vehicle_model: {
                id: vehicle_model.uuid,
                make: vehicle_model.make,
                name: vehicle_model.name,
                category: vehicle_model.category,
                active: vehicle_model.active
              }
            }
          )
        rescue ActiveRecord::RecordNotFound
          skip_authorization
          render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
        end

        def create
          authorize VehicleModel

          vehicle_model = VehicleModel.new(vehicle_model_params)

          if vehicle_model.save
            render_success(
              data: {
                vehicle_model: {
                  id: vehicle_model.uuid,
                  make: vehicle_model.make,
                  name: vehicle_model.name,
                  category: vehicle_model.category,
                  active: vehicle_model.active
                }
              },
              status: :created
            )
          else
            render_error(
              code: "validation_failed",
              message: I18n.t("errors.validation_failed"),
              status: :unprocessable_content,
              fields: vehicle_model.errors.to_hash
            )
          end
        end

        def update
          vehicle_model = VehicleModel.find_by!(uuid: params[:id])
          authorize vehicle_model

          if vehicle_model.update(vehicle_model_params)
            render_success(
              data: {
                vehicle_model: {
                  id: vehicle_model.uuid,
                  make: vehicle_model.make,
                  name: vehicle_model.name,
                  category: vehicle_model.category,
                  active: vehicle_model.active
                }
              }
            )
          else
            render_error(
              code: "validation_failed",
              message: I18n.t("errors.validation_failed"),
              status: :unprocessable_content,
              fields: vehicle_model.errors.to_hash
            )
          end
        rescue ActiveRecord::RecordNotFound
          skip_authorization
          render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
        end

        def destroy
          vehicle_model = VehicleModel.find_by!(uuid: params[:id])
          authorize vehicle_model

          if vehicle_model.vehicles.exists?
            render_error(
              code: "cannot_delete",
              message: "Cannot delete vehicle model that is linked to existing vehicles",
              status: :unprocessable_content
            )
          else
            vehicle_model.destroy
            head :no_content
          end
        rescue ActiveRecord::RecordNotFound
          skip_authorization
          render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
        end

        private

        def vehicle_model_params
          params.permit(:name, :make, :category, :active)
        end
      end
    end
  end
end
