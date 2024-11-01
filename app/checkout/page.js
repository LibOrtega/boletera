import Link from 'next/link';
import MisComprasClient from './MisComprasClient';

export const metadata = {
  title: 'Mis Compras',
  description: 'Revisa tus compras recientes',
};

export default function MisComprasPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gracias por comprar tu acceso</h1>
        <Link href="/" className="btn bg-pink-200 hover:bg-pink-300 text-gray-800">
          Volver a Home
        </Link>
      </div>
  {/**   <MisComprasClient />  */} 
    </div>
  );
}
