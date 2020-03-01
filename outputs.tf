output "cache_bucket_name" {
  description = "Cache S3 bucket name"
  value       = aws_s3_bucket.cache.bucket
}

output "badge_url" {
  description = "The URL of the build badge when badge_enabled is enabled"
  value       = aws_codebuild_project._.badge_url
}