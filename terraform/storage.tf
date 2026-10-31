resource "google_storage_bucket" "securestock_logs" {
  #checkov:skip=CKV_GCP_62:Dedicated access-log destination; avoid recursive logging

  name                        = "securestock-logs-${var.bucket_name_suffix}"
  project                     = var.project_id
  location                    = var.bucket_location
  force_destroy               = false
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  labels = {
    project     = "securestock"
    environment = var.environment
    purpose     = "access-logs"
    managed_by  = "terraform"
  }

  versioning {
    enabled = true
  }
}

resource "google_storage_bucket" "securestock_demo" {
  name                        = "securestock-demo-${var.bucket_name_suffix}"
  project                     = var.project_id
  location                    = var.bucket_location
  force_destroy               = false
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  labels = {
    project     = "securestock"
    environment = var.environment
    purpose     = "demo-storage"
    managed_by  = "terraform"
  }

  versioning {
    enabled = true
  }

  logging {
    log_bucket = google_storage_bucket.securestock_logs.name
  }
}