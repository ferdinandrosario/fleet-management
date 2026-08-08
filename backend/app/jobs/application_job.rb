class ApplicationJob < ActiveJob::Base
  attr_accessor :tenant_slug

  def serialize
    super.merge("tenant_slug" => Current.tenant || tenant_slug)
  end

  def deserialize(job_data)
    super
    self.tenant_slug = job_data["tenant_slug"]
  end

  around_perform do |job, block|
    if job.tenant_slug.present? && TenantRegistry.exists?(slug: job.tenant_slug)
      Current.tenant = job.tenant_slug
      Apartment::Tenant.switch(job.tenant_slug, &block)
    else
      block.call
    end
  end
end
