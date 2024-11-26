import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order";
import connectMongo from "@/libs/mongoose";

export async function POST(request) {
  // Asegurarse de conectar a MongoDB
  await connectMongo();

  try {
    // Extraer datos del cuerpo de la solicitud
    const body = await request.json();
    const { stripeSessionId } = body;

    // Verificar que se proporcionó el stripeSessionId
    if (!stripeSessionId) {
      return NextResponse.json(
        { message: "Stripe Session ID es requerido", status: "error" },
        { status: 400 }
      );
    }

    // Buscar la orden en la base de datos
    const order = await Order.findOne({ stripeSessionId });

    // Verificar si la orden existe
    if (!order) {
      return NextResponse.json(
        {
          message: "Orden no encontrada. El código QR no es válido.",
          status: "not_found",
        },
        { status: 404 }
      );
    }

    // Verificar si la orden ya ha sido escaneada
    if (order.isScanned) {
      return NextResponse.json(
        {
          message: "Esta orden ya ha sido escaneada anteriormente.",
          status: "already_scanned",
        },
        { status: 400 }
      );
    }

    // Marcar la orden como escaneada
    order.isScanned = true;
    await order.save();

    // Responder con la orden actualizada
    return NextResponse.json(
      {
        message: "Orden escaneada exitosamente",
        status: "success",
        order: {
          id: order._id,
          user: order.user,
          event: order.event,
          isScanned: order.isScanned,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Manejo de errores inesperados
    console.error("Error en el escaneo:", error);
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        status: "error",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
