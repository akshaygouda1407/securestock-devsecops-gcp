terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 8.9"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "terraform_data" "securestock" {
  input = {
    project_name = "SecureStock"
    environment  = var.environment
    managed_by   = "Terraform"
  }
}