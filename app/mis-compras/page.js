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
        <h1 className="text-3xl font-bold">Mis Compras</h1>
        <Link href="/" className="btn btn-primary">
          Volver a Eventos
        </Link>
      </div>
      <MisComprasClient />
    </div>
  );
}
