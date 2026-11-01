locals {
  app = "appName = '${var.app_name}'"
}

# One dashboard, two pages: "Is it useful?" (PRD KPIs) and "Is it healthy?" (what alerts watch).
resource "newrelic_one_dashboard" "sdlc" {
  name = "The Art of SDLC"
  # Anyone in this New Relic account can view it (not the public internet).
  permissions = "public_read_only"

  page {
    name = "Learning (KPIs)"

    widget_billboard {
      title  = "Stations completed (7 days)"
      row    = 1
      column = 1
      width  = 4
      nrql_query {
        query = "SELECT count(*) FROM PageAction WHERE ${local.app} AND actionName = 'station_completed' SINCE 7 days ago"
      }
    }

    widget_billboard {
      title  = "Phase 1 completed (7 days)"
      row    = 1
      column = 5
      width  = 4
      nrql_query {
        query = "SELECT count(*) FROM PageAction WHERE ${local.app} AND actionName = 'phase1_completed' SINCE 7 days ago"
      }
    }

    widget_pie {
      title  = "Ranks reached (7 days)"
      row    = 1
      column = 9
      width  = 4
      nrql_query {
        query = "SELECT count(*) FROM PageAction WHERE ${local.app} AND actionName = 'rank_reached' FACET rank SINCE 7 days ago"
      }
    }

    widget_bar {
      title  = "Completions by station: where do learners drop off?"
      row    = 2
      column = 1
      width  = 6
      height = 4
      nrql_query {
        query = "SELECT count(*) FROM PageAction WHERE ${local.app} AND actionName = 'station_completed' FACET station SINCE 7 days ago LIMIT 42"
      }
    }

    widget_table {
      title  = "Lesson feedback: % helpful by station"
      row    = 2
      column = 7
      width  = 6
      height = 4
      nrql_query {
        query = "SELECT percentage(count(*), WHERE helpful IS TRUE OR helpful = 'true') AS 'Helpful %', count(*) AS 'Votes' FROM PageAction WHERE ${local.app} AND actionName = 'feedback_given' FACET station SINCE 30 days ago"
      }
    }
  }

  page {
    name = "Health"

    widget_line {
      title  = "JavaScript errors per 100 page views (alert above 1)"
      row    = 1
      column = 1
      width  = 6
      nrql_query {
        query = "SELECT filter(count(*), WHERE eventType() = 'JavaScriptError') * 100 / filter(count(*), WHERE eventType() IN ('PageView', 'BrowserInteraction')) AS 'Error rate %' FROM JavaScriptError, PageView, BrowserInteraction WHERE ${local.app} TIMESERIES SINCE 1 day ago"
      }
    }

    widget_line {
      title  = "Largest Contentful Paint p75, seconds (alert above 2.5)"
      row    = 1
      column = 7
      width  = 6
      nrql_query {
        query = "SELECT percentile(largestContentfulPaint, 75) FROM PageViewTiming WHERE ${local.app} AND timingName = 'largestContentfulPaint' TIMESERIES SINCE 1 day ago"
      }
    }

    widget_line {
      title  = "Page views"
      row    = 2
      column = 1
      width  = 6
      nrql_query {
        query = "SELECT count(*) FROM PageView WHERE ${local.app} TIMESERIES SINCE 1 day ago"
      }
    }

    widget_table {
      title  = "Top JavaScript errors"
      row    = 2
      column = 7
      width  = 6
      nrql_query {
        query = "SELECT count(*) FROM JavaScriptError WHERE ${local.app} FACET errorMessage, userAgentName SINCE 1 day ago LIMIT 10"
      }
    }
  }
}
