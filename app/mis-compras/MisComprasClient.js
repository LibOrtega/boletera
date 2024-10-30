"use client";

import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';
import ButtonCheckout from '@/components/ButtonCheckout';

const MisComprasClient = () => {
  const { cart, removeFromCart } = useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return <p className="text-pink-300">No tienes compras recientes.</p>; // Cambiado a rosa
  }

  const handleRemove = (eventId) => {
    removeFromCart(eventId); // Llama a la función para eliminar el evento del carrito
  };

  const handleBuy = (event) => {
    // Redirigir a la URL de Stripe directamente
    const stripeUrl = "https://buy.stripe.com/dR64hd5Hx2tC82AcMM?quantity=5"; // URL de tu evento de Stripe
    window.location.href = stripeUrl; // Redirige a la URL de Stripe
  };

  return (
    <div>
      <ul className="space-y-4">
        {cart.map((item, index) => (
          <li key={index} className="bg-gray-800 text-white p-4 rounded-lg shadow"> {/* Cambiado a fondo gris oscuro y texto blanco */}
            <h3 className="text-lg font-semibold">{item.event.name}</h3> {/* Cambiado a blanco */}
            <p>Fecha: {item.event.formattedDate}</p> {/* Cambiado a blanco */}
            <p>Cantidad: {item.quantity}</p> {/* Cambiado a blanco */}
            <p>Comprador: {item.buyer.name}</p> {/* Cambiado a blanco */}
            <p>Email: {item.buyer.email}</p> {/* Cambiado a blanco */}
            <p>Teléfono: {item.buyer.phone}</p> {/* Cambiado a blanco */}
            <div className="flex justify-between mt-4">
              <button 
                className="btn bg-red-500 hover:bg-red-600 text-white" 
                onClick={() => handleRemove(item.event._id)} // Llama a handleRemove con el ID del evento
              >
                Eliminar Evento
              </button>

              <ButtonCheckout />
              <button 
                className="btn bg-pink-200 hover:bg-pink-300 text-gray-800" 
                onClick={() => handleBuy(item.event)} // Llama a handleBuy con el evento
              >
                Comprar  1
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MisComprasClient;
