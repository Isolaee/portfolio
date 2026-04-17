# Uses the default VPC to avoid NAT gateway costs (~$30/month).
# If you've deleted the default VPC, recreate it with:
#   aws ec2 create-default-vpc --region eu-north-1 --profile eero

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
  # Default VPC subnets are all public (map_public_ip_on_launch = true)
  filter {
    name   = "map-public-ip-on-launch"
    values = ["true"]
  }
}

# ── ALB: allow HTTP/HTTPS from anywhere ──────────────────────────────────────

resource "aws_security_group" "alb" {
  name        = "${local.name}-alb"
  description = "Allow HTTP/HTTPS inbound to the load balancer"
  vpc_id      = data.aws_vpc.default.id
  tags        = local.tags

  ingress {
    description      = "HTTP"
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    description      = "HTTPS"
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ── ECS tasks: only accept traffic from the ALB ───────────────────────────────

resource "aws_security_group" "ecs" {
  name        = "${local.name}-ecs"
  description = "Allow inbound on container port from ALB only"
  vpc_id      = data.aws_vpc.default.id
  tags        = local.tags

  ingress {
    description     = "Container port from ALB"
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Allow all outbound (ECR pull, SSM, CloudWatch)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
