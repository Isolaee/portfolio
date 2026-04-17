terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment to store state in S3 instead of locally:
  # backend "s3" {
  #   bucket  = "your-tfstate-bucket"
  #   key     = "portfolio/terraform.tfstate"
  #   region  = "eu-north-1"
  #   profile = "eero"
  # }
}

provider "aws" {
  region = var.region
  # Credentials via env vars: AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY
  # Export them before running terraform:
  #   export AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id --profile eero)
  #   export AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key --profile eero)
  #   export AWS_DEFAULT_REGION=eu-north-1
}

locals {
  name = "portfolio"
  tags = {
    Project   = "portfolio"
    ManagedBy = "terraform"
  }
}
