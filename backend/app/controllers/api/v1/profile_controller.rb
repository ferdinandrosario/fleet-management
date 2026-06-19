module Api
  module V1
    # The authenticated user's own account: view, update (e.g. saved language),
    # and logout (revoke all refresh tokens). Every action authorizes against
    # the user themselves (Pundit default-deny via UserPolicy).
    class ProfileController < AuthenticatedController
      def show
        authorize Current.user, :show?
        render_success(data: UserSerializer.call(Current.user))
      end

      def update
        authorize Current.user, :update?
        if Current.user.update(profile_params)
          render_success(data: UserSerializer.call(Current.user))
        else
          render_validation_errors(Current.user)
        end
      end

      def logout
        authorize Current.user, :logout?
        AuthTokenService.revoke_all(Current.user)
        render_success(data: { signed_out: true })
      end

      private

      def profile_params
        params.require(:user).permit(:name, :locale)
      end
    end
  end
end
