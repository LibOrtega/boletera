"use client";

import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';

const MisComprasClient = () => {
  const { cart, removeFromCart } = useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return <p>No tienes compras recientes.</p>;
  }

  const handleRemove = (eventId) => {
    removeFromCart(eventId); // Llama a la función para eliminar el evento del carrito
  };

  const handleBuy = (event) => {
    // Redirigir a la URL de Stripe directamente
    const stripeUrl = "https://buy.stripe.com/dR64hd5Hx2tC82AcMM"; // URL de tu evento de Stripe
    window.location.href = stripeUrl; // Redirige a la URL de Stripe
  };

  return (
    <div>
      <ul className="space-y-4">
        {cart.map((item, index) => (
          <li key={index} className="bg-base-200 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{item.event.name}</h3>
            <p>Fecha: {item.event.formattedDate}</p>
            <p>Cantidad: {item.quantity}</p>
            <p>Comprador: {item.buyer.name}</p>
            <p>Email: {item.buyer.email}</p>
            <p>Teléfono: {item.buyer.phone}</p>
            <div className="flex justify-between mt-4">
              <button 
                className="btn bg-red-500 hover:bg-red-600 text-white" 
                onClick={() => handleRemove(item.event._id)} // Llama a handleRemove con el ID del evento
              >
                Eliminar Evento
              </button>
              <button 
                className="btn bg-pink-200 hover:bg-pink-300 text-gray-800" 
                onClick={() => handleBuy(item.event)} // Llama a handleBuy con el evento
              >
                Comprar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MisComprasClient;
