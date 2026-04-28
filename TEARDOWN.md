# AWS Infrastructure Teardown

Run these steps **after** the Cloudflare Pages site is live and verified.

## 1. Scale the ECS service to zero (optional pre-step)

Stop billing for any running Fargate tasks before destroying infra:

```bash
aws ecs update-service \
  --cluster portfolio \
  --service portfolio \
  --desired-count 0 \
  --profile personal \
  --region eu-north-1
```

## 2. Destroy all Terraform-managed resources

```bash
cd aws/terraform
terraform destroy -var-file=terraform.tfvars
```

This removes in order:
- ECS service, task definition, cluster
- Application Load Balancer + listeners + target group
- CloudWatch log group and alarms
- AppAutoScaling policies and targets
- ACM certificate
- Security groups
- IAM roles and policies

Confirm with `yes` when prompted. Takes ~3 minutes.

## 3. Delete the ECR repository

The ECR repo is not managed by Terraform (images are pushed by the deploy script).
Delete it manually:

```bash
aws ecr delete-repository \
  --repository-name portfolio \
  --force \
  --profile personal \
  --region eu-north-1
```

## 4. Delete SSM parameters

```bash
aws ssm delete-parameters \
  --names /portfolio/name /portfolio/email \
  --profile personal \
  --region eu-north-1
```

## 5. Remove SES credentials (if no longer used elsewhere)

If the SES SMTP user was created only for this project, delete it:

```bash
# Find the IAM user
aws iam list-users --profile personal | grep portfolio

# Delete access keys first, then the user
aws iam delete-access-key --user-name <user> --access-key-id <key> --profile personal
aws iam delete-user --user-name <user> --profile personal
```

## 6. Verify zero spend

After destroy, check the AWS Cost Explorer or billing dashboard to confirm
no hourly charges remain. The ALB was the dominant cost (~$16/month);
its deletion should show up within an hour.

## 7. Clean up local state (optional)

```bash
rm aws/terraform/terraform.tfstate
rm aws/terraform/terraform.tfstate.backup
```

Keep the Terraform files in git as a reference — they document what was built.
