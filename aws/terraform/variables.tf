variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-north-1"
}

variable "aws_profile" {
  description = "AWS CLI profile"
  type        = string
  default     = "eero"
}

variable "account_id" {
  description = "AWS account ID (12-digit number)"
  type        = string
}

variable "domain" {
  description = "Root domain name, e.g. example.com — must already have a Route 53 hosted zone"
  type        = string
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = 3000
}

variable "cpu" {
  description = "Fargate task CPU units (256 = 0.25 vCPU, minimum)"
  type        = string
  default     = "256"
}

variable "memory" {
  description = "Fargate task memory in MiB (512 = minimum for 256 CPU)"
  type        = string
  default     = "512"
}

variable "scale_in_idle_minutes" {
  description = "Minutes of zero requests before the service scales in to 0 tasks"
  type        = number
  default     = 10
}
