import { resend } from "@/lib/resend"

// Resend's sandbox sender: it can only deliver to the Resend account's own
// email until a domain is verified and this is swapped for an address on it.
const FROM = "onboarding@resend.dev"

export async function sendEmail({
  to,
  subject,
  body,
}: {
  to: string
  subject: string
  body: string
}) {
  // The SDK doesn't throw on an API error; it returns it. Rethrow so the run
  // marks this step failed instead of passing a send that never happened.
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [to.trim()],
    subject,
    text: body,
  })
  if (error || !data) {
    throw new Error(`Failed to send email: ${error.message}`)
  }

  return { id: data.id }
}
