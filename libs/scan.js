import connectMongo from "@/libs/mongoose";
import Order from "@/models/Order";

export async function Scan(stripeSessionId) {
  await connectMongo();

  //   Tienes que hacer un query a la base de datos para buscar la orden con el stripeSessionId que recibes como parámetro si no existe la orden con ese stripeSessionId tienes que retornar un error y si existe la orden tienes que poner el campo isScanned en true y retornar la orden.

  // Query
  const order = await Order.findOne({ stripeSessionId });
  if (!order) {
    throw new Error("Order not found");
  }

  // Update
  order.isScanned = true;
  order.save();

  return order;
}
