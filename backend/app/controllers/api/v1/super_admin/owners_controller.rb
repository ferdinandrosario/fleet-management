# Super-admin owner/tenant management controller (Session 4).
module Api
  module V1
    module SuperAdmin
      class OwnersController < BaseController
        def index
          authorize Owner
          scope = Owner.order(created_at: :desc)
          scope = scope.where(status: params[:status]) if params[:status].present?

          pagy, owners = pagy(scope)
          render_success(
            data: {
              owners: owners.map { |o| OwnerSerializer.call(o, super_admin: true) },
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
          owner = Owner.find_by!(uuid: params[:id])
          authorize owner
          render_success(data: { owner: OwnerSerializer.call(owner, super_admin: true) })
        rescue ActiveRecord::RecordNotFound
          skip_authorization
          render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
        end

        def create
          authorize Owner
          plan = if owner_params[:plan_id].present?
                   Plan.find_by(uuid: owner_params[:plan_id])
          else
                   Plan.find_by(tier: owner_params[:plan_tier] || :basic)
          end

          if plan.nil?
            return render_error(code: "plan_not_found", message: I18n.t("errors.not_found"), status: :unprocessable_content)
          end

          name = owner_params[:name].presence || owner_params[:company_name]
          company_name = owner_params[:company_name].presence || name
          slug = owner_params[:slug].presence || name.to_s.parameterize(separator: "_")

          result = TenantProvisioningService.call(
            name: name,
            company_name: company_name,
            address: owner_params[:address],
            slug: slug,
            plan: plan,
            owner_name: owner_params[:owner_name],
            owner_phone: owner_params[:owner_phone],
            password: owner_params[:password]
          )

          if result.success?
            render_success(data: { owner: OwnerSerializer.call(result.owner, super_admin: true) }, status: :created)
          else
            render_error(
              code: "validation_failed",
              message: I18n.t("errors.validation_failed"),
              status: :unprocessable_content,
              fields: result.errors
            )
          end
        end

        def update
          owner = Owner.find_by!(uuid: params[:id])
          authorize owner

          ActiveRecord::Base.transaction do
            owner.update!(owner_params)

            # If name or company_name was updated, update the tenant registry?
            # Wait, the user didn't mention updating tenant registry, just the owner's name/company_name.
            # "The tenant name should be updated during transactions." -> owner.update! handles this in a transaction.
          end

          render_success(data: { owner: OwnerSerializer.call(owner, super_admin: true) })
        rescue ActiveRecord::RecordInvalid => e
          render_error(
            code: "validation_failed",
            message: I18n.t("errors.validation_failed"),
            status: :unprocessable_content,
            fields: e.record.errors.to_hash
          )
        rescue ActiveRecord::RecordNotFound
          skip_authorization
          render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
        end

        def update_status
          owner = Owner.find_by!(uuid: params[:id])
          authorize owner

          if Owner.statuses.key?(status_params[:status])
            owner.update!(status: status_params[:status])
            render_success(data: { owner: OwnerSerializer.call(owner, super_admin: true) })
          else
            render_error(code: "invalid_status", message: I18n.t("errors.validation_failed"), status: :unprocessable_content)
          end
        rescue ActiveRecord::RecordNotFound
          skip_authorization
          render_error(code: "not_found", message: I18n.t("errors.not_found"), status: :not_found)
        end

        private

        def owner_params
          params.permit(:name, :company_name, :address, :slug, :plan_id, :plan_tier, :owner_name, :owner_phone, :password)
        end

        def status_params
          params.permit(:status)
        end
      end
    end
  end
end
