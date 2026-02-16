import "dotenv/config"

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback
}

export const env = {
  get databaseUrl() {
    return optional(
      "DATABASE_URL",
      "postgres://intern:secret@localhost:5432/intern",
    )
  },
  get usersApiUrl() {
    return optional("USERS_API_URL", "http://users-api.zt.foreningenbs.no:8000")
  },
  get usersApiKey() {
    return required("USERS_API_KEY")
  },
  get sessionSecret() {
    return required("SESSION_SECRET")
  },
  get devSso() {
    return !!process.env.DEV_SSO
  },
  get registeruserNotifyEmail() {
    return optional("REGISTERUSER_NOTIFY_EMAIL", "it-gruppa@foreningenbs.no")
  },
  get smtpHost() {
    return optional("SMTP_HOST", "localhost")
  },
  get smtpPort() {
    return parseInt(optional("SMTP_PORT", "25"), 10)
  },
  get smtpUser() {
    return optional("SMTP_USER")
  },
  get smtpPass() {
    return optional("SMTP_PASS")
  },
  get printerDbDsn() {
    return optional("PRINTERDB_DSN")
  },
  get printerDbUser() {
    return optional("PRINTERDB_USERNAME")
  },
  get printerDbPass() {
    return optional("PRINTERDB_PASSWORD")
  },
  get googleApiKey() {
    return optional("GOOGLE_API_KEY")
  },
  get appUrl() {
    return optional("APP_URL", "https://foreningenbs.no")
  },
  get calendarApiUrl() {
    return optional("CALENDAR_API_URL", "http://localhost:8000")
  },
  get officeNetwork() {
    return optional("OFFICE_NETWORK", "158.36.185.160/28")
  },
}
