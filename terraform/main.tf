terraform {
  required_version = ">= 1.5.0"
}

resource "terraform_data" "securestock" {
  input = {
    project_name = "SecureStock"
    environment  = "local"
    managed_by   = "Terraform"
  }
}

output "project_name" {
  description = "Project being validated locally"
  value       = terraform_data.securestock.output.project_name
}

output "environment" {
  description = "Target environment"
  value       = terraform_data.securestock.output.environment
}
