# ── Application Auto Scaling target ──────────────────────────────────────────
# Allows desired_count to move between 0 (fully stopped) and 1 (running).

resource "aws_appautoscaling_target" "this" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.this.name}/${aws_ecs_service.this.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 0
  max_capacity       = 1
}

# ── Scale OUT ─────────────────────────────────────────────────────────────────
# When ECS has 0 tasks running, the ALB has no healthy targets and returns
# HTTP 503 for every request. We watch for those 5XX responses and immediately
# spin up one task. The visitor sees a ~503 for roughly 45 s (Fargate cold
# start) before the task becomes healthy and the ALB routes normally.

resource "aws_appautoscaling_policy" "scale_out" {
  name               = "${local.name}-scale-out"
  policy_type        = "StepScaling"
  service_namespace  = aws_appautoscaling_target.this.service_namespace
  resource_id        = aws_appautoscaling_target.this.resource_id
  scalable_dimension = aws_appautoscaling_target.this.scalable_dimension

  step_scaling_policy_configuration {
    adjustment_type         = "ExactCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment          = 1
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "no_healthy_targets" {
  alarm_name          = "${local.name}-no-healthy-targets"
  alarm_description   = "ALB is returning 5XX — no healthy ECS targets. Scale out to 1."
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_ELB_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 1
  treat_missing_data  = "notBreaching" # silence when the site is idle

  dimensions = {
    LoadBalancer = aws_lb.this.arn_suffix
  }

  alarm_actions = [aws_appautoscaling_policy.scale_out.arn]
  tags          = local.tags
}

# ── Scale IN ──────────────────────────────────────────────────────────────────
# After var.scale_in_idle_minutes of zero requests we stop the task entirely.
# treat_missing_data = "breaching" means CloudWatch treats absent data points
# (which happen when the ALB truly receives no traffic) as zeroes, so the
# alarm fires even when there is no activity at all.

resource "aws_appautoscaling_policy" "scale_in" {
  name               = "${local.name}-scale-in"
  policy_type        = "StepScaling"
  service_namespace  = aws_appautoscaling_target.this.service_namespace
  resource_id        = aws_appautoscaling_target.this.resource_id
  scalable_dimension = aws_appautoscaling_target.this.scalable_dimension

  step_scaling_policy_configuration {
    adjustment_type         = "ExactCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = 0 # scale to exactly 0 tasks
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "idle" {
  alarm_name          = "${local.name}-idle"
  alarm_description   = "No ALB requests for ${var.scale_in_idle_minutes} min. Scale in to 0."
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = var.scale_in_idle_minutes
  metric_name         = "RequestCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  treat_missing_data  = "breaching" # no data = no requests = idle

  dimensions = {
    LoadBalancer = aws_lb.this.arn_suffix
  }

  alarm_actions = [aws_appautoscaling_policy.scale_in.arn]
  tags          = local.tags
}
