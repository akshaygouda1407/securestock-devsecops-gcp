output "project_name" {
  description = "SecureStock project name."
  value       = terraform_data.securestock.output.project_name
}

output "environment" {
  description = "Deployment environment."
  value       = terraform_data.securestock.output.environment
}

output "logs_bucket_name" {
  description = "Google Cloud Storage access logs bucket name."
  value       = google_storage_bucket.securestock_logs.name
}

output "demo_bucket_name" {
  description = "Google Cloud Storage demo bucket name."
  value       = google_storage_bucket.securestock_demo.name
}