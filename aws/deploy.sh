#!/bin/sh
# Deploy portfolio to AWS ECR + Fargate
# Usage: ./aws/deploy.sh <region> <account-id> [tag]
set -e

REGION=${1:?Usage: deploy.sh REGION ACCOUNT_ID [TAG]}
ACCOUNT=${2:?Usage: deploy.sh REGION ACCOUNT_ID [TAG]}
TAG=${3:-latest}
REPO="$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/portfolio"

echo "==> Logging in to ECR"
aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "$REPO"

echo "==> Creating ECR repository (if it doesn't exist)"
aws ecr describe-repositories --repository-names portfolio --region "$REGION" 2>/dev/null \
  || aws ecr create-repository --repository-name portfolio --region "$REGION"

echo "==> Building image"
docker build -t "portfolio:$TAG" .

echo "==> Tagging and pushing"
docker tag "portfolio:$TAG" "$REPO:$TAG"
docker push "$REPO:$TAG"

echo "==> Registering task definition"
sed \
  -e "s/ACCOUNT_ID/$ACCOUNT/g" \
  -e "s/REGION/$REGION/g" \
  aws/task-definition.json \
  | aws ecs register-task-definition --cli-input-json file:///dev/stdin --region "$REGION"

echo "==> Done! Update your ECS service to use the new task definition revision."
