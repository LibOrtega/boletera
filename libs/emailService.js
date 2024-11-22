import { EmailTemplate } from '@/components/EmailTemplate';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendEmailWithQrCode(email, firstName, qrCode){
  console.log({email, qrCode})
  const { data, error } = await resend.emails.send({
    from: 'Liberticket <lib@liberticket.com>',
    to: email,
    subject: 'Gracias por comprar en Liberticket',
    react: EmailTemplate({ firstName: firstName, qrCode: qrCode }),
  });

  if (error) {
    return console.error("Caca falla", error)
  }

  console.log("NO FALLAAAA")
};