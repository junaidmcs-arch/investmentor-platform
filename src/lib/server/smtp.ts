/** Share bounded transport settings between sign-in mail and the outbox worker. */
export function smtpConnectionUrl() {
  const raw = process.env.EMAIL_SERVER;
  if (!raw) throw new Error("EMAIL_SERVER is required.");
  const url = new URL(raw);
  if (!["smtp:", "smtps:"].includes(url.protocol)) throw new Error("EMAIL_SERVER must use SMTP or SMTPS.");
  url.searchParams.set("connectionTimeout", "10000");
  url.searchParams.set("greetingTimeout", "10000");
  url.searchParams.set("socketTimeout", "30000");
  url.searchParams.set("debug", "false");
  url.searchParams.set("logger", "false");
  if (process.env.NODE_ENV === "production") {
    url.searchParams.set("requireTLS", "true");
    url.searchParams.set("ignoreTLS", "false");
    url.searchParams.set("tls.rejectUnauthorized", "true");
  }
  return url.toString();
}
