# Alert conditions (AOS-10.3). Starting thresholds from the plan: JS error rate above 1% of page views, or
# page load (LCP) p75 above 2.5 s, sustained for 15 minutes. Tune them after launch.

resource "newrelic_alert_policy" "site" {
  name                = "The Art of SDLC: site health"
  incident_preference = "PER_CONDITION"
}

resource "newrelic_nrql_alert_condition" "js_error_rate" {
  policy_id = newrelic_alert_policy.site.id
  # Views include in-app route changes (BrowserInteraction), not just full page loads.
  name                         = "JavaScript error rate above 1% of page views"
  description                  = "Check the Health page and 'Top JavaScript errors'; roll back the last release if it started with a deploy."
  enabled                      = true
  violation_time_limit_seconds = 86400
  aggregation_window           = 300
  # Low traffic: evaluate each window after a fixed wait, rather than waiting for later data
  # to arrive (the default "event flow" never closes a window on a quiet site).
  aggregation_method = "event_timer"
  aggregation_timer  = 300

  nrql {
    query = "SELECT filter(count(*), WHERE eventType() = 'JavaScriptError') * 100 / filter(count(*), WHERE eventType() IN ('PageView', 'BrowserInteraction')) FROM JavaScriptError, PageView, BrowserInteraction WHERE ${local.app}"
  }

  critical {
    operator              = "above"
    threshold             = 1
    threshold_duration    = 900
    threshold_occurrences = "all"
  }
}

resource "newrelic_nrql_alert_condition" "slow_lcp" {
  policy_id                    = newrelic_alert_policy.site.id
  name                         = "Page load slow: LCP p75 above 2.5 s"
  description                  = "Check recent releases and asset sizes; compare with the Lighthouse results in CI."
  enabled                      = true
  violation_time_limit_seconds = 86400
  aggregation_window           = 300
  # Low traffic: evaluate each window after a fixed wait, rather than waiting for later data
  # to arrive (the default "event flow" never closes a window on a quiet site).
  aggregation_method = "event_timer"
  aggregation_timer  = 300

  nrql {
    query = "SELECT percentile(largestContentfulPaint, 75) FROM PageViewTiming WHERE ${local.app} AND timingName = 'largestContentfulPaint'"
  }

  critical {
    operator              = "above"
    threshold             = 2.5
    threshold_duration    = 900
    threshold_occurrences = "all"
  }
}

# Notifications: none, by PO decision (2026-11-01). Issues open in New Relic under
# Alerts → Issues & activity. To notify someone later, add a notification destination, channel
# and workflow for this policy (email, Slack or PagerDuty).
