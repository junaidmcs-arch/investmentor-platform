import { loadEnvConfig } from "@next/env";
import nodemailer from "nodemailer";
loadEnvConfig(process.cwd());
let running=true;
process.on("SIGTERM",()=>{running=false;});
process.on("SIGINT",()=>{running=false;});
async function main() {
  if(!process.env.EMAIL_SERVER || !process.env.EMAIL_FROM) throw new Error("Email configuration missing");
  const {getPool}=await import("../src/lib/server/db");
  const {claimEmailJob,markEmailDelivered,retryEmail}=await import("../src/lib/server/delivery");
  const {smtpConnectionUrl}=await import("../src/lib/server/smtp");
  const pool=getPool(); const transport=nodemailer.createTransport(smtpConnectionUrl());
  const from=process.env.EMAIL_FROM;
  const messageDomain=new URL(process.env.AUTH_URL ?? "http://localhost").hostname;
  try {
    do {
      let processed=0;
      // --once drains a bounded batch. A long-running worker returns to the loop promptly.
      while(running && processed < 10) {
        const job=await claimEmailJob();
        if(!job) break;
        processed++;
        try {
          await transport.sendMail({from,to:job.to_email,subject:job.subject,text:job.body,messageId:`<${job.id}@${messageDomain}>`,disableFileAccess:true,disableUrlAccess:true});
          await markEmailDelivered(job);
        } catch {
          await retryEmail(job);
          console.error("An email delivery attempt failed; the queue will retry where eligible.");
        }
      }
      await pool.query("DELETE FROM rate_limits WHERE expires_at < now()-interval '1 day'");
      await pool.query('DELETE FROM sessions WHERE expires < now()');
      await pool.query('DELETE FROM verification_token WHERE expires < now()');
      if(process.argv.includes("--once")) break;
      if(running) await new Promise(resolve=>setTimeout(resolve,5000));
    } while(running);
  } finally {transport.close();await pool.end();}
}
main().catch(()=>{console.error("Email worker stopped. Verify database, sender, and SMTP configuration.");process.exitCode=1;});
