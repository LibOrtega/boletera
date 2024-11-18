import nodemailer from 'nodemailer';

const sendEmailWithQRCode = async (recipientEmail, qrCodeImage) => {
  // Configura el transportador de Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail', // o el servicio que estés usando
    auth: {
      user: process.env.EMAIL_USER, // tu correo electrónico
      pass: process.env.EMAIL_PASS, // tu contraseña
    },
  });

  // Configura el contenido del correo
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: 'Tu Código QR',
    text: 'Aquí está tu código QR.',
    attachments: [
      {
        filename: 'qr_code.png', // nombre del archivo
        content: qrCodeImage, // contenido de la imagen
        cid: 'qr_code_image', // identificador de contenido
      },
    ],
  };

  // Envía el correo
  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado con éxito');
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
};

export default sendEmailWithQRCode;