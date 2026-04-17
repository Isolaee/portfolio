#!/bin/sh
# Deploy portfolio to AWS ECR + Fargate
# Usage: ./aws/deploy.sh [region] [account-id] [tag] [profile]
# Defaults: region=eu-north-1, tag=latest, profile=personal
set -e

REGION=${1:-eu-north-1}
ACCOUNT=${2:?Usage: deploy.sh [REGION] ACCOUNT_ID [TAG] [PROFILE]}
TAG=${3:-latest}
PROFILE=${4:-}
REPO="$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/portfolio"

# Use --profile only if one was provided; otherwise fall back to env vars
# (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_PROFILE)
PROFILE_FLAG=""
if [ -n "$PROFILE" ]; then
  PROFILE_FLAG="--profile $PROFILE"
  echo "==> Using AWS profile: $PROFILE  region: $REGION"
else
  echo "==> Using ambient AWS credentials  region: $REGION"
fi

echo "==> Logging in to ECR"
aws ecr get-login-password --region "$REGION" $PROFILE_FLAG \
  | docker login --username AWS --password-stdin "$REPO"

echo "==> Creating ECR repository (if it doesn't exist)"
aws ecr describe-repositories --repository-names portfolio --region "$REGION" $PROFILE_FLAG 2>/dev/null \
  || aws ecr create-repository --repository-name portfolio --region "$REGION" $PROFILE_FLAG

echo "==> Building image"
docker build -t "portfolio:$TAG" .

echo "==> Tagging and pushing"
docker tag "portfolio:$TAG" "$REPO:$TAG"
docker push "$REPO:$TAG"

echo "==> Done! Forcing new ECS deployment..."
aws ecs update-service \
  --cluster portfolio \
  --service portfolio \
  --force-new-deployment \
  --region "$REGION" $PROFILE_FLAG

echo "==> Deployed! Site will be live at https://e-isola.dev once the task is healthy (~60s)."
