# Authorization policy for vehicle reviews and completion proof photos (Session 8).
class ReviewPolicy < ApplicationPolicy
  def index? = true
  def create? = record.customer_id == user.id
end
