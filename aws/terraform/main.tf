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
  region  = var.region
  profile = var.aws_profile
}

locals {
  name = "portfolio"
  tags = {
    Project   = "portfolio"
    ManagedBy = "terraform"
  }
}
