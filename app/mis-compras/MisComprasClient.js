"use client";

import { useState, useEffect } from 'react';

const MisComprasClient = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompras = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const comprasEjemplo = [
        { id: 1, evento: "Concierto de Rock", fecha: "2024-10-15", precio: 50 },
        { id: 2, evento: "Festival de Jazz", fecha: "2024-11-20", precio: 75 },
        { id: 3, evento: "Opera Clásica", fecha: "2024-12-05", precio: 100 },
      ];
      
      setCompras(comprasEjemplo);
      setLoading(false);
    };

    fetchCompras();
  }, []);

  if (loading) {
    return <div>Cargando tus compras...</div>;
  }

  return (
    <div>
      {compras.length === 0 ? (
        <p>No tienes compras recientes.</p>
      ) : (
        <ul className="space-y-4">
          {compras.map((compra) => (
            <li key={compra.id} className="bg-base-200 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold">{compra.evento}</h3>
              <p>Fecha: {compra.fecha}</p>
              <p>Precio: ${compra.precio}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MisComprasClient;
