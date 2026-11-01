variable "account_id" {
  description = "New Relic account ID (public)."
  type        = number
  default     = 8688649
}

variable "app_name" {
  description = "The browser app that receives the site's data."
  type        = string
  default     = "the-art-of-sdlc"
}
