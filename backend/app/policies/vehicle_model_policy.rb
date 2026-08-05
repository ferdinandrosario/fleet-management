# frozen_string_literal: true

# Policy for vehicle model catalog operations.
# Only authenticated SuperAdmins can manage vehicle models.
class VehicleModelPolicy < ApplicationPolicy
  def index? = super_admin?
  def show? = super_admin?
  def create? = super_admin?
  def update? = super_admin?
  def destroy? = super_admin?

  private

  def super_admin?
    Current.super_admin.present?
  end
end
