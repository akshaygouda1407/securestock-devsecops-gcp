variable "project_id" {
  description = "Google Cloud project ID. Replace the local placeholder before deployment."
  type        = string
  default     = "securestock-local"
}

variable "region" {
  description = "Google Cloud provider region."
  type        = string
  default     = "us-central1"
}

variable "bucket_location" {
  description = "Google Cloud Storage bucket location."
  type        = string
  default     = "US"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "local"

  validation {
    condition     = contains(["local", "dev", "staging", "prod"], var.environment)
    error_message = "Environment must be local, dev, staging, or prod."
  }
}

variable "bucket_name_suffix" {
  description = "Unique lowercase suffix for globally unique GCS bucket names."
  type        = string
  default     = "change-me-unique-suffix"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$", var.bucket_name_suffix))
    error_message = "Bucket suffix must contain 3-32 lowercase letters, numbers, or hyphens, and start and end with a letter or number."
  }
}