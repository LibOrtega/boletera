import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { createCheckout } from "@/libs/stripe";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// By default, it doesn't force users to be authenticated. But if they are, it will prefill the Checkout data with their email and/or credit card
export async function POST(req) {
  console.log("Hola Perro");

  try {
    const body = await req.json(); //toma el data que recibe
    console.log("body =>", body);
    const {
      eventName,
      buyerName,
      email,
      phone,
      quantity,
      amount,
      totalAmount,
      eventId,
      fees,
    } = body;

    const lineItems = [];

    //Parsear los datos para stripe
    const productData = {
      quantity,
      price_data: {
        currency: "MXN",
        unit_amount: parseInt(amount * 100),
        product_data: {
          name: `${eventName}`,
          description: `Ticket para ${eventName}`,
          images: [
            "https://res.cloudinary.com/patitorosa/image/upload/v1660532530/extras/patitorosa%20ticket.jpg",
          ],
        },
      },
    };

    const feesData = {
      quantity: 1,
      price_data: {
        currency: "MXN",
        unit_amount: parseInt(parseFloat(totalAmount * 100).toFixed(2)),
        product_data: {
          name: "cargos",
          description: "Cargos LiberTicket",
          images: [
            "https://res.cloudinary.com/patitorosa/image/upload/v1660533341/extras/patitofee.jpg",
          ],
          metadata: {
            stripeFee: fees.stripeFee,
            serviceFee: fees.serviceFee,
            totalFees: fees.totalFees,
            eventId: eventId,
          },
        },
      },
    };

    lineItems.push(productData);
    lineItems.push(feesData);

    const metadata = {
      fees,
      eventId,
      qty: quantity,
      unitPrice: amount,
      totalAmount,
    };

    const data = {
      lineItems,
      metadata,
      allowed_countries: ["MX"],
    };

    const options = {
      locale: "es",
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      mode: "payment",
      metadata: {
        stringifyMetadata: JSON.stringify(metadata),
      },
      billing_address_collection: "auto",
      phone_number_collection: {
        enabled: true,
      },
      line_items: lineItems,
      success_url:
        process.env.NEXTAUTH_URL +
        `/thanks/checkoutsuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.NEXTAUTH_URL,
    };

    const session = await stripe.checkout.sessions.create(options);

    return NextResponse.json(session);
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
