import ticketsLib from "@/libs/ticketsLib";
import sendEmailWithQrCode from "@/libs/emailService";
import unixToFormat from "@/utils/unixToFormat";

export const createTicket = async (ticketData) => {
  // const startTimeLocalText = `${unixToFormat(
  //   eventData.startTime,
  //   "d 'de' MMMM yyyy h:mm aa"
  // )} `;

  try {
    const qrCodeImage = await ticketsLib.generateQrCode({
      orderId: ticketData.orderId,
      eventId: ticketData.eventId.toString(),
      user: {
        email: ticketData.userData.customerEmail,
        name: ticketData.userData.customerName,
      },
    });

    const sendEmail = await sendEmailWithQrCode(
      ticketData.userData.customerEmail,
      ticketData.userData.customerName,
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

// ... código existente ...
