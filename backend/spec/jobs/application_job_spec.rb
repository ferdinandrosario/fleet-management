require "rails_helper"

class TestJob < ApplicationJob
  def perform
    # test perform
  end
end

RSpec.describe ApplicationJob, type: :job do
  let(:job) { TestJob.new }

  it "serializes and deserializes tenant slug" do
    Current.tenant = "test-tenant"
    serialized = job.serialize
    expect(serialized["tenant_slug"]).to eq("test-tenant")

    job.deserialize(serialized)
    expect(job.tenant_slug).to eq("test-tenant")
  end

  it "switches tenant during perform when tenant exists" do
    provision_tenant("activetenant")
    job.tenant_slug = "activetenant"

    expect(Apartment::Tenant).to receive(:switch).with("activetenant").and_call_original
    job.perform_now
  end

  it "calls block directly when tenant slug is absent" do
    job.tenant_slug = nil
    expect(Apartment::Tenant).not_to receive(:switch)
    job.perform_now
  end
end
