# DNS is managed in Cloudflare (Cloudflare Registrar locks nameservers).
# This file only creates the ACM certificate.
#
# After apply, run:
#   terraform output acm_validation_records
#
# Add those CNAMEs in Cloudflare DNS, then run apply again — Terraform will
# wait until ACM sees the records and marks the certificate as ISSUED.

resource "aws_acm_certificate" "this" {
  domain_name               = var.domain
  subject_alternative_names = ["www.${var.domain}"]
  validation_method         = "DNS"
  tags                      = local.tags

  lifecycle {
    create_before_destroy = true
  }
}

# Waits until ACM confirms the certificate is validated.
# Won't complete until you've added the CNAMEs in Cloudflare.
resource "aws_acm_certificate_validation" "this" {
  certificate_arn = aws_acm_certificate.this.arn
}
