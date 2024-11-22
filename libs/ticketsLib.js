const orderid = require("order-id")(process.env.BASE_SECRET);
import cloudinaryLib from "@/libs/cloudinary";
import dateNowUnix from "@/utils/dateNowUnix";
import settingsLib from "@/libs/settingsLib";
const QRCode = require("qrcode");
import { encode } from "js-base64";

const ticketsLib = {
  calculateFees: async (db, subtotal) => {
    try {
      const parsedSubtotal = parseFloat(subtotal);
      const settings = await settingsLib.getSettings(db);
      const { commissions } = settings;
      const {
        stripeFixedPercentage,
        stripeFixedCommision,
        platformFixedPercentage,
        platformFixedCommision,
      } = commissions;

      const stripeFee =
        parsedSubtotal * (stripeFixedPercentage / 100) + stripeFixedCommision;
      const patitoFee =
        parsedSubtotal * (platformFixedPercentage / 100) +
        platformFixedCommision;

      const fees = {
        stripeFee,
        patitoFee,
        totalFee: stripeFee + patitoFee,
      };

      return fees;
    } catch (error) {
      console.error("error calculating fees", error);
      throw error;
    }
  },
  generateOrderId: () => {
    return orderid.generate();
  },
  generateQrCode: async (ticketData) => {
    try {
      //base64 encode ticketData
      const data = encode(JSON.stringify(ticketData));
      const qrCode = await QRCode.toDataURL(data);
      return qrCode;
    } catch (error) {
      "error generating qr code", error;
      return;
    }
  },
  generateTicketImageText: ({
    userName,
    ticketQuantity,
    ticketType,
    event,
    startTimeLocalText,
  }) => {
    const userNameText = userName ? userName.toUpperCase() : "NO NAME";
    const quantityText =
      ticketQuantity > 1
        ? `${ticketQuantity} ENTRADAS `
        : `${ticketQuantity} ENTRADA `;

    let ticketTypeText = "";
    switch (ticketType) {
      case "attendees":
        ticketTypeText = "DE ASISTENTE";
        break;
      case "participants":
        ticketTypeText = "DE PARTICIPANTE";
        break;
      default:
        ticketTypeText = "";
    }

    const placeNameText = `${event.placeName}`;
    const placeCityText = `${event.placeCity} ${event.placeState} ${event.placeCountry}`;
    const dateText = `${startTimeLocalText}`;

    const text = `${
      event.name
    } %0A %0A${quantityText}${ticketTypeText}%0A${userNameText} %0A %0A${`LUGAR Y FECHA:`} %0A${placeNameText}%0A${placeCityText}%0A${dateText}`;

    return text;
  },
  generateTicket: async (db, ticketData, startTimeLocalText) => {
    const {
      event,
      user,
      ticketType,
      stripeSession,
      stripePaymentIntent = null,
      ticketQuantity = 1,
    } = ticketData;

    try {
      //generate qr and upload to cloudinary
      const orderId = await ticketsLib.generateOrderId(db);
      const userId = user._id.toString();
      const eventId = event._id.toString();
      const qr = await ticketsLib.generateQrCode({
        orderId,
        eventId,
        ticketType,
        user: {
          email: user.email,
          name: user.name,
        },
      });

      //generate ticket image text
      const ticketImageText = ticketsLib.generateTicketImageText({
        userName: user.name,
        ticketQuantity,
        event,
        startTimeLocalText,
        ticketType,
      });

      // //upload qr to cloudinary
      const qrUrl = await cloudinaryLib.uploadQrTicket(
        qr,
        orderId,
        ticketImageText
      );

      const ticket = {
        ticketType,
        eventId: eventId,
        orderId,
        qrUrl,
        ticketQuantity,
        userEmail: user.email,
        user: {
          id: userId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          artistName: user.artistName || "",
          about: user.about || "",
          legalAge: user.legalAge || false,
        },
        stripeSession: stripeSession || false,
        stripePaymentIntent: stripePaymentIntent || null,
        createdAt: dateNowUnix(),
        updatedAt: dateNowUnix(),
        expiresAt: event.endTime + 3600 * 24, //1 day after the event ends
      };

      // //save ticket in db and return ticket
      const ticketSaved = await db.collection("tickets").insertOne(ticket);
      if (!ticketSaved) {
        throw new Error(
          JSON.stringify({
            message: {
              es: "Error al registrar ticket",
              en: "Error registering ticket",
            },
          })
        );
      }

      return ticket;
    } catch (error) {
      console.error("error generating ticket", error);
      throw error;
    }
  },
  calculateTicketStatsByEventId: async (db, eventId) => {
    //get tickets stats using eventId
    try {
      const tickets = await db
        .collection("tickets")
        .find({ eventId: eventId })
        .toArray();

      //seprate tickets by ticket type
      const ticketsByType = {};
      tickets.forEach((ticket) => {
        if (!ticketsByType[ticket.ticketType]) {
          ticketsByType[ticket.ticketType] = [];
        }
        ticketsByType[ticket.ticketType].push(ticket);
      });

      const { participants, attendees } = ticketsByType;
      //only attendees have a stripe session
      const participantsTotal = participants?.reduce(
        (acc, curr) => acc + curr.ticketQuantity,
        0
      );

      const participantsScanned = participants?.reduce(
        (acc, curr) => acc + (curr.used ? 1 * curr.ticketQuantity : 0),
        0
      );

      const attendeesScanned = attendees?.reduce(
        (acc, curr) => acc + (curr.used ? 1 * curr.ticketQuantity : 0),
        0
      );

      //calculate total of attendees ticketQuantity
      const attendeesTotal = attendees?.reduce(
        (acc, curr) => acc + curr.ticketQuantity,
        0
      );

      //calculate fees using stripe session
      const attendeesStripeFees = attendees?.reduce((acc, curr) => {
        if (curr.stripeSession) {
          return acc + curr.stripeSession.fees.stripeFee;
        } else {
          return acc;
        }
      }, 0);

      const attendeesPatitoFees = attendees?.reduce((acc, curr) => {
        if (curr.stripeSession) {
          return acc + curr.stripeSession.fees.patitoFee;
        } else {
          return acc;
        }
      }, 0);

      const attendeesTotalSold = attendees?.reduce((acc, curr) => {
        if (curr.stripeSession) {
          return acc + curr.stripeSession.amount_total;
        } else {
          return acc;
        }
      }, 0);
      //iterate tru tickets and calculate stats
      const ticketStats = {
        participants: {
          totalTickets: participantsTotal,
          scannedTickets: participantsScanned,
        },
        attendees: {
          fees: {
            stripe: attendeesStripeFees,
            patito: attendeesPatitoFees,
            total: attendeesStripeFees + attendeesPatitoFees,
          },
          totalTickets: attendeesTotal,
          scannedTickets: attendeesScanned,
          totalSold:
            attendeesTotalSold - attendeesStripeFees - attendeesPatitoFees,
          totalSoldWithFees: attendeesTotalSold,
        },
        total: {
          tickets: (participantsTotal || 0) + (attendeesTotal || 0),
          sold: attendeesTotalSold - attendeesStripeFees - attendeesPatitoFees,
          soldWithFees: attendeesTotalSold,
        },
        currency: "mxn",
      };

      return ticketStats;
    } catch (error) {
      console.error("error calculating ticket stats", error);
      throw new Error("error calculating ticket stats", error);
    }
  },
  getTicketFromQr: async (db, qrData) => {
    //validate qr ticket, is if valid return ticket data
    try {
      const { orderId, eventId, user } = qrData;
      //get ticket that matches orderId, eventId and user email
      const ticket = await db
        .collection("tickets")
        .findOne({ orderId, eventId, userEmail: user.email });

      if (!ticket) {
        throw new Error(
          JSON.stringify({
            message: {
              es: "Ticket no existente",
              en: "Ticket does not exist",
            },
          })
        );
        return;
      }
      return ticket;
    } catch (error) {
      console.error("error getting ticket from qr", error);
      throw new Error(
        JSON.stringify({
          message: {
            es: "Ticket no existente",
            en: "Ticket does not exist",
          },
        })
      );
    }
  },
  isTicketExpired: (expiresAt) => {
    const now = dateNowUnix();
    if (now > expiresAt) {
      return true;
    } else {
      return false;
    }
  },
  stripeTicketExists: async (db, stripePaymentIntent) => {
    //check if ticket exists
    try {
      const ticket = await db
        .collection("tickets")
        .findOne({ stripePaymentIntent: stripePaymentIntent });

      if (!ticket) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error("error checking if ticket exists", error);
      throw new Error("error checking if ticket exists", error);
    }
  },
};

export default ticketsLib;
