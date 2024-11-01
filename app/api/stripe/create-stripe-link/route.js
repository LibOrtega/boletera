import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { createCheckout } from "@/libs/stripe";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

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
    } = body;

    return NextResponse.json(
      "hola perro , saludos desde el backend, ya recibi tu data"
    );
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
