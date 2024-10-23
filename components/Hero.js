"use client"

import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';

const Hero = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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

  const handleBuyClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setFormData({ name: '', email: '', phone: '', quantity: 1 });
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
    <section className="max-w-7xl mx-auto bg-base-100 text-base-content px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6">Eventos Disponibles</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event._id} className="bg-base-200 rounded-lg overflow-hidden shadow-md flex flex-col h-[500px]">
            <img src={event.imageurl} alt={event.name} className="w-full h-64 object-cover" />
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <p className="text-sm text-base-content opacity-60 mb-2">{formatDate(event.date)}</p>
                <h3 className="text-xl font-bold mb-3">{event.name}</h3>
                <p className="text-sm text-base-content opacity-60 mb-2">
                  <span className="inline-block mr-2">📍</span>{event.location}
                </p>
                <p className="text-sm text-base-content opacity-60 mb-4">
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
          <div className="bg-base-100 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Añadir al Carrito</h2>
            <p className="mb-4">Evento: {selectedEvent?.name}</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block mb-2">Nombre completo</label>
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
                <label htmlFor="email" className="block mb-2">Correo electrónico</label>
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
                <label htmlFor="phone" className="block mb-2">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="quantity" className="block mb-2">Cantidad de boletos</label>
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
                  className="btn mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 border-none"
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
