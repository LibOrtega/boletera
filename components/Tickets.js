import ticketsLib from "@/lib/ticketsLib";
import sendEmailWithQRCode from "@/libs/emailService";

const createTicket = async (ticketData, startTimeLocalText) => {
  try {
    const orderId = ticketsLib.generateOrderId();
    const qrCodeImage = await ticketsLib.generateQrCode({
      orderId,
      eventId: ticketData.event._id.toString(),
      ticketType: ticketData.ticketType,
      user: {
        email: ticketData.user.email,
        name: ticketData.user.name,
      },
    });

    await sendEmailWithQRCode(ticketData.user.email, qrCodeImage);

    const ticket = await ticketsLib.generateTicket({
      ...ticketData,
      orderId,
      qrCode: qrCodeImage,
    }, startTimeLocalText);

    return ticket;
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw error;
  }
};

// ... código existente ...
