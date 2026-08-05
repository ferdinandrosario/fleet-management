module Api
  module V1
    module SuperAdmin
      class ApiDocGrantsController < BaseController
        def index
          authorize ApiDocGrant
          grants = ApiDocGrant.order(created_at: :desc)
          render json: {
            status: "success",
            data: grants.as_json(only: [ :id, :email, :token, :expires_at, :created_at ]),
            error: nil
          }
        end

        def create
          authorize ApiDocGrant
          expires_in_hours = params[:expires_in_hours].to_i
          expires_in_hours = 24 if expires_in_hours <= 0

          grant = ApiDocGrant.new(
            email: params[:email],
            expires_at: expires_in_hours.hours.from_now
          )

          if grant.save
            render json: {
              status: "success",
              data: grant.as_json(only: [ :id, :email, :token, :expires_at, :created_at ]),
              error: nil
            }, status: :created
          else
            render json: {
              status: "error",
              data: nil,
              error: {
                code: "validation_failed",
                message: "Validation failed",
                fields: grant.errors.messages
              }
            }, status: :unprocessable_entity
          end
        end

        def destroy
          authorize ApiDocGrant
          grant = ApiDocGrant.find(params[:id])
          grant.destroy
          render json: {
            status: "success",
            data: { deleted: true },
            error: nil
          }
        end
      end
    end
  end
end
