terraform {
  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
      version = "~> 1.53.0"
    }
  }
}

provider "openstack" {
  user_name           = "user01"
  password            = "FisaOpenStack01!"
  tenant_name         = "team01"
  auth_url            = "http://172.21.33.100:5000/v3"
  domain_name         = "Default"
  user_domain_name    = "Default"
  project_domain_name = "Default"
  region              = "RegionOne"
}
