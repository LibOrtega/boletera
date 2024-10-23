import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Asegúrate de que tu clave secreta de Stripe esté en .env.local

export async function POST(req) {
  const { eventId } = await req.json();

  // Aquí puedes obtener los detalles del evento desde tu base de datos si es necesario
  // const event = await getEventById(eventId); // Implementa esta función según tu lógica

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd', // Cambia a tu moneda
            product_data: {
              name: 'Boleto para el evento', // Cambia según el evento
              // Puedes agregar más detalles aquí
            },
            unit_amount: 2000, // Cambia a la cantidad en centavos (ej. $20.00 sería 2000)
          },
          quantity: 1, // Cambia según la cantidad de boletos
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success`, // Cambia a tu URL de éxito
      cancel_url: `${req.headers.origin}/cancel`, // Cambia a tu URL de cancelación
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}
