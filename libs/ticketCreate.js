import ticketsLib from "@/libs/ticketsLib";
import sendEmailWithQrCode from "@/libs/emailService";

export const createTicket = async (ticketData) => {
  try {
    const qrCodeImage = await ticketsLib.generateQrCode({
      orderId: ticketData.orderId,
      eventId: ticketData.eventId.toString(),
      user: {
        email: ticketData.userData.customerEmail,
        name: ticketData.userData.customerName,
      },
      stripeSessionId: ticketData.stripeSessionId,
    });

    const sendEmail = await sendEmailWithQrCode(
      ticketData.userData.customerEmail,
      qrCodeImage
    );
    console.log(sendEmail);

    const ticket = "Ticket generado";

    return ticket;
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw error;
  }
};
