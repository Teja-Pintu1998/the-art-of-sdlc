# New Relic monitoring as code (AOS-10.2, 10.3). Run from this folder:
#   source ../../.env.newrelic.local && terraform init && terraform apply
terraform {
  required_version = ">= 1.9"
  required_providers {
    newrelic = {
      source  = "newrelic/newrelic"
      version = "~> 3.60"
    }
  }
}

# The user API key comes from NEW_RELIC_API_KEY (never stored in the repo).
provider "newrelic" {
  account_id = var.account_id
  region     = "US"
}
