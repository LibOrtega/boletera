import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import connectMongo from "@/libs/mongoose";
import configFile from "@/config";
import User from "@/models/User";
import { findCheckoutSession } from "@/libs/stripe";
import Order from "@/models/Order";
import { createTicket } from "@/components/Tickets";
import { EmailTemplate } from "@/components/EmailTemplate";
const orderid = require("order-id")("key");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const webhookSecret = "whsec_hLM5Dix9rssFelCOBfbWWRvTlHcFZ0Qy";

// This is where we receive Stripe webhook events
// It used to update the user data, send emails, etc...
// By default, it'll store the user in the database
// See more: https://shipfa.st/docs/features/payments
export async function POST(req) {
  await connectMongo();

  const body = await req.text();

  const signature = headers().get("stripe-signature");

  let data;
  let eventType;
  let event;

  // verify Stripe event is legit
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log("Event:", event);
  } catch (err) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  data = event.data;
  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        try {
          const session = await findCheckoutSession(data.object.id);

          console.log("Session:", session);
          console.log("Session metadata:", session.metadata);
          console.log("Customer details:", session.customer_details);

          let { metadata } = session;

          // Validate required metadata
          if (!metadata) {
            throw new Error("No metadata found in session");
          }

          // Parse stringified metadata
          const parsedMetadata = JSON.parse(metadata.stringifyMetadata);
          metadata = { ...metadata, ...parsedMetadata };

          // Validate and parse numeric values with fallbacks
          const orderData = {
            eventId: metadata.eventId,
            fees: metadata.fees || 0,
            unitPrice: parseFloat(metadata.unitPrice || 0),
            quantity: parseInt(metadata.qty || 1),
            totalAmount: parseFloat(metadata.totalAmount || 0),
          };

          // Validate required fields
          if (!orderData.eventId) {
            throw new Error("eventId is required in metadata");
          }

          const customerId = data.object.customer;
          const userId = data.object.client_reference_id;
          const customerEmail = session.customer_details?.email;
          const customerName = session.customer_details?.name;

          let user;
          let customer;

          // Try to find or create user in this order:
          // 1. By userId if provided
          // 2. By customer email if Stripe customer exists
          // 3. By session email
          // 4. Create new user with session email

          if (userId) {
            user = await User.findById(userId);
            console.log("Found user by ID:", user);
          }

          if (!user && customerId) {
            try {
              customer = await stripe.customers.retrieve(customerId);
              console.log("Found Stripe customer:", customer);

              if (customer.email) {
                user = await User.findOne({ email: customer.email });
                console.log("Found user by customer email:", user);
              }
            } catch (err) {
              console.error("Error retrieving Stripe customer:", err);
            }
          }

          if (!user && customerEmail) {
            user = await User.findOne({ email: customerEmail });
            console.log("Found user by session email:", user);

            if (!user) {
              user = await User.create({
                email: customerEmail,
                name: customerName || "Guest User",
              });
              console.log("Created new user from session details:", user);
            }
          }

          // If we still don't have a user, create one with a temporary email
          if (!user) {
            const tempEmail = `guest_${Date.now()}@temporary.com`;
            user = await User.create({
              email: tempEmail,
              name: "Guest User",
            });
            console.log("Created temporary user:", user);
          }

          // Create new order with validated data
          const newOrder = await Order.create({
            orderId: orderid.generate(),
            userId: user._id,
            eventId: orderData.eventId,
            stripeSessionId: session.id,
            fees: orderData.fees,
            unitPrice: orderData.unitPrice,
            quantity: orderData.quantity,
            totalAmount: orderData.totalAmount || session.amount_total / 100, // Fallback to session amount
          });

          await newOrder.save();
          console.log("New order created:", newOrder);

          const ticketQrData = {
            orderId: orderid.generate(),
            eventId: orderData.eventId,
            userData: {
              customerEmail,
              customerName,
            },
          };

          const ticketCreated = await createTicket(ticketQrData);
          console.log({ ticketCreated });

          // Update user data
          if (customerId) {
            user.customerId = customerId;
            await user.save();
            console.log("Updated user with customerId:", user);
          }
        } catch (error) {
          console.error("Error in checkout.session.completed:", error);
          console.error("Error details:", {
            message: error.message,
            name: error.name,
            stack: error.stack,
          });
          throw error;
        }
        break;
      }

      case "checkout.session.expired": {
        // User didn't complete the transaction
        // You don't need to do anything here, by you can send an email to the user to remind him to complete the transaction, for instance
        break;
      }

      case "customer.subscription.updated": {
        // The customer might have changed the plan (higher or lower plan, cancel soon etc...)
        // You don't need to do anything here, because Stripe will let us know when the subscription is canceled for good (at the end of the billing cycle) in the "customer.subscription.deleted" event
        // You can update the user data to show a "Cancel soon" badge for instance
        break;
      }

      case "customer.subscription.deleted": {
        // The customer subscription stopped
        // ❌ Revoke access to the product
        // The customer might have changed the plan (higher or lower plan, cancel soon etc...)
        const subscription = await stripe.subscriptions.retrieve(
          data.object.id
        );
        const user = await User.findOne({ customerId: subscription.customer });

        // Revoke access to your product
        user.hasAccess = false;
        await user.save();

        break;
      }

      case "invoice.paid": {
        // Customer just paid an invoice (for instance, a recurring payment for a subscription)
        // ✅ Grant access to the product
        const priceId = data.object.lines.data[0].price.id;
        const customerId = data.object.customer;

        const user = await User.findOne({ customerId });

        // Make sure the invoice is for the same plan (priceId) the user subscribed to
        if (user.priceId !== priceId) break;

        // Grant user access to your product. It's a boolean in the database, but could be a number of credits, etc...
        user.hasAccess = true;
        await user.save();

        break;
      }

      case "invoice.payment_failed":
        // A payment failed (for instance the customer does not have a valid payment method)
        // ❌ Revoke access to the product
        // ⏳ OR wait for the customer to pay (more friendly):
        //      - Stripe will automatically email the customer (Smart Retries)
        //      - We will receive a "customer.subscription.deleted" when all retries were made and the subscription has expired

        break;

      default:
      // Unhandled event type
    }
  } catch (e) {
    console.error("stripe error: " + e.message + " | EVENT TYPE: " + eventType);
  }

  return NextResponse.json({});
}
