# On-the-wire shape of a user. `id` is the external uuid (never the bigint PK).
# Phone is returned only to the user themselves (the profile endpoints).
module UserSerializer
  module_function

  def call(user)
    {
      id: user.uuid,
      name: user.name,
      phone: user.phone,
      role: user.role,
      locale: user.locale,
      phone_verified: user.phone_verified?
    }
  end
end
