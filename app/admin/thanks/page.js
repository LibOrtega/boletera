"use client"
import { useEffect } from 'react';
import Link from 'next/link';

export default function CheckoutPage() {
  useEffect(() => {
    // Redirigir a la página de agradecimiento sin parámetros
    window.history.replaceState({}, document.title, "/thanks");
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gracias por tu compra</h1>
        <Link href="/" className="btn bg-pink-200 hover:bg-pink-300 text-gray-800">
          Volver a Home
        </Link>
      </div>
      <p className="text-lg">Tu pedido ha sido procesado con éxito. Recibirás un correo de confirmación en breve.</p>
      {/* Puedes agregar más detalles sobre el pedido aquí */}
      {/* <MisComprasClient /> */}
    </div>
  );
}
