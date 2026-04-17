output "acm_validation_records" {
  description = "Add these CNAMEs in Cloudflare DNS to validate the ACM certificate"
  value = {
    for dvo in aws_acm_certificate.this.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }
}

output "cloudflare_cname" {
  description = "Add this CNAME in Cloudflare for e-isola.dev and www.e-isola.dev (proxy OFF / DNS only)"
  value       = aws_lb.this.dns_name
}

output "site_url" {
  description = "Your site URL"
  value       = "https://${var.domain}"
}

output "alb_dns_name" {
  description = "ALB DNS name — use this to CNAME if not on Route 53"
  value       = aws_lb.this.dns_name
}

output "ecr_image_uri" {
  description = "ECR image URI — use in deploy.sh or CI/CD"
  value       = "${var.account_id}.dkr.ecr.${var.region}.amazonaws.com/${local.name}:latest"
}

output "ecs_cluster" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.this.name
}

output "ecs_service" {
  description = "ECS service name"
  value       = aws_ecs_service.this.name
}

output "force_deploy_command" {
  description = "Run this after pushing a new image to deploy it"
  value       = "aws ecs update-service --cluster ${aws_ecs_cluster.this.name} --service ${aws_ecs_service.this.name} --force-new-deployment --region ${var.region} --profile ${var.aws_profile}"
}
