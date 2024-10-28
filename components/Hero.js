"use client"

import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Hero = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '6141231234', // Número de ejemplo
    quantity: 1
  });

  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        } else {
          console.error('Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };

  const handleBuyClick = async (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    
    // Lógica para crear la sesión de pago
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventId: event._id }), // Envía el ID del evento
    });

    if (response.ok) {
      const session = await response.json();
      window.location.href = session.url; // Redirige a la URL de Stripe
    } else {
      console.error('Error al crear la sesión de pago');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setFormData({ name: '', email: '', phone: '1234567890', quantity: 1 }); // Restablecer el número de ejemplo
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cartItem = {
      event: selectedEvent,
      quantity: parseInt(formData.quantity),
      buyer: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      }
    };
    addToCart(cartItem);
    console.log('Añadido al carrito:', cartItem);
    handleCloseModal();
    router.push('/mis-compras');
  };

  return (
    <section className="max-w-7xl mx-auto text-base-content px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-white">Eventos Disponibles</h1>
      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        {events.map((event) => (
          <div key={event._id} className="bg-gray-900 rounded-lg overflow-hidden shadow-md flex flex-col h-fit w-[300px]">
            <img src={event.imageurl} alt={event.name} className="w-full h-64 object-cover" />
            <div className="p-4 flex-grow flex flex-col justify-between text-white">
              <div className='text-white'>
                <p className="text-sm  opacity-60 mb-2">{formatDate(event.date)}</p>
                <h3 className="text-md font-bold mb-3">{event.name}</h3>
                <p className="text-sm opacity-60 mb-2">
                  <span className="inline-block mr-2">📍</span>{event.location}
                </p>
                <p className="text-sm opacity-60 mb-4">
                  <span className="inline-block mr-2">🎟️</span>{event.organizer}
                </p>
              </div>

              <button 
                className="btn w-full mt-auto bg-pink-200 hover:bg-pink-300 text-gray-800 border-none" 
                onClick={() => handleBuyClick(event)}
              >
                Comprar
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full"> {/* Cambiado a gris oscuro */}
            <h2 className="text-2xl font-bold mb-4 text-white">Añadir al Carrito</h2> {/* Cambiado a blanco */}
            <p className="mb-4 text-white">Evento: {selectedEvent?.name}</p> {/* Cambiado a blanco */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block mb-2 text-white">Nombre completo</label> {/* Cambiado a blanco */}
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block mb-2 text-white">Correo electrónico</label> {/* Cambiado a blanco */}
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="phone" className="block mb-2 text-white">Teléfono (10 dígitos)</label> {/* Cambiado a blanco */}
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  maxLength="10" // Limitar a 10 dígitos
                  placeholder="Ej: 6141231234" // Placeholder agregado
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="quantity" className="block mb-2 text-white">Cantidad de boletos</label> {/* Cambiado a blanco */}
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="btn mr-2 bg-pink-200 hover:bg-pink-300 text-gray-800 border-none"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn bg-pink-200 hover:bg-pink-300 text-gray-800 border-none"
                >
                  Añadir al Carrito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
   
    </section>
  );
};

export default Hero;

function EventCard({ image, title, date, location, organizer }) {
  return (
    <div className="overflow-hidden bg-gray-800 text-white rounded-lg">
      <img
        alt={title}
        className="object-cover w-full h-48"
        height="200"
        src={image}
        style={{
          aspectRatio: "300/200",
          objectFit: "cover",
        }}
        width="300"
      />
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-sm text-gray-400 mb-1">{date}</p>
        <p className="text-sm text-gray-400">{location}</p>
        <p className="text-sm text-base-content opacity-60 mb-4">
                  <span className="inline-block mr-2">🎟️</span>{organizer}
                </p>
      </div>
      
    </div>
  )
}
