import "server-only";
import { env } from "@/lib/config/env";
import { siteConfig } from "@/lib/config/site";

/**
 * Canaux de diffusion. En développement (provider "console"), les messages
 * sont affichés dans les logs du serveur. En production, configurez
 * EMAIL_PROVIDER="resend" + RESEND_API_KEY et/ou SMS_PROVIDER="twilio" + TWILIO_*.
 */
export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  if (env.email.provider === "resend" && env.email.resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.email.resendApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: env.email.from, to, subject: `${subject} — ${siteConfig.shortName}`, text }),
      });
      return res.ok;
    } catch (err) {
      console.error("[email] échec d'envoi", err);
      return false;
    }
  }
  console.info(`\n[email:console] À : ${to}\nObjet : ${subject}\n${text}\n`);
  return true;
}

export async function sendSms(to: string, text: string): Promise<boolean> {
  if (env.sms.provider === "twilio" && env.sms.twilioSid && env.sms.twilioToken && env.sms.twilioFrom) {
    try {
      const auth = Buffer.from(`${env.sms.twilioSid}:${env.sms.twilioToken}`).toString("base64");
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.sms.twilioSid}/Messages.json`, {
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ To: to, From: env.sms.twilioFrom, Body: text }),
      });
      return res.ok;
    } catch (err) {
      console.error("[sms] échec d'envoi", err);
      return false;
    }
  }
  console.info(`\n[sms:console] À : ${to}\n${text}\n`);
  return true;
}
