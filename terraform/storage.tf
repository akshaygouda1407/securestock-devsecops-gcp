
resource "google_storage_bucket" "securestock_logs" {
  #checkov:skip=CKV_GCP_62:Dedicated access-log destination; avoid recursive logging
  name                        = "securestock-logs-change-this-to-unique-id"
  location                    = "US"
  force_destroy               = false
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  versioning {
    enabled = true
  }
}

resource "google_storage_bucket" "securestock_demo" {
  name                        = "securestock-demo-change-this-to-unique-id"
  location                    = "US"
  force_destroy               = false
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  versioning {
    enabled = true
  }

  logging {
    log_bucket = google_storage_bucket.securestock_logs.name
  }
}
