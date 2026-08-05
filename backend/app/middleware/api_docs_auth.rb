class ApiDocsAuth
  def initialize(app)
    @app = app
    @auth = Rack::Auth::Basic.new(app, "API Documentation") do |username, password|
      if (super_admin = SuperAdmin.find_by(email: username))
        super_admin.authenticate(password).present?
      else
        ApiDocGrant.active.exists?(email: username, token: password)
      end
    end
  end

  def call(env)
    if env["PATH_INFO"].start_with?("/api-docs")
      @auth.call(env)
    else
      @app.call(env)
    end
  end
end
