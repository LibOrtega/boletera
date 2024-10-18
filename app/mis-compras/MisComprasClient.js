"use client";

import { useCart } from '@/app/context/CartContext';

const MisComprasClient = () => {
  const { cart } = useCart();

  if (cart.length === 0) {
    return <p>No tienes compras recientes.</p>;
  }

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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MisComprasClient;
