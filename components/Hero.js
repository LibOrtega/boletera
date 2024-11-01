"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/libs/api';

const Hero = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '6141231234', // Número de ejemplo
    quantity: 1 // Cantidad de boletos
  });
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para mostrar el formulario
  const [totalCost, setTotalCost] = useState(0); // Estado para el costo total

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
    setIsModalOpen(true); // Abre el formulario
    setTotalCost(event.price); // Inicializa el costo total con el precio del evento
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Calcular el costo total cada vez que cambie la cantidad
    if (name === 'quantity') {
      const newTotalCost = selectedEvent.price * value; // Calcula el nuevo costo total
      setTotalCost(newTotalCost);
    }
  };

  const handlePhoneFocus = () => {
    if (formData.phone === '6141231234') {
      setFormData({ ...formData, phone: '' }); // Borra el número de ejemplo al hacer clic
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // El costo total ya se calcula en handleInputChange
    console.log("Evento:", selectedEvent.name);
    console.log("Nombre:", formData.name);
    console.log("Correo:", formData.email);
    console.log("Teléfono:", formData.phone);
    console.log("Cantidad de boletos:", formData.quantity);
    console.log("Costo total:", totalCost);

    // Aquí puedes agregar la lógica para redirigir a Stripe o mostrar un mensaje
    

   
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
                <p className="text-xl opacity-60 mb-4 font-bold ">
                  <span className="inline-block mr-2 ">🤑</span>${event.price} MXN
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

      {/* Modal para el formulario de compra */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-white">Completa tu compra</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block mb-2 text-white">Nombre completo</label>
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
                <label htmlFor="email" className="block mb-2 text-white">Correo electrónico</label>
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
                <label htmlFor="phone" className="block mb-2 text-white">Teléfono (10 dígitos)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onFocus={handlePhoneFocus} // Borra el número de ejemplo al hacer clic
                  className="w-full p-2 border rounded"
                  maxLength="10" // Limitar a 10 dígitos
                  placeholder="Ej: 6141231234" // Placeholder agregado
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="quantity" className="block mb-2 text-white">Cantidad de boletos</label>
                <div className="flex items-center">
                  <button 
                    type="button" 
                    onClick={() => handleInputChange({ target: { name: 'quantity', value: Math.max(1, formData.quantity - 1) } })} 
                    className="btn bg-pink-200 hover:bg-pink-300 text-gray-800 border-none mr-2"
                  >
                    -
                  </button>
                  <label className="text-white p-2 border rounded">{formData.quantity}</label>
                  <button 
                    type="button" 
                    onClick={() => handleInputChange({ target: { name: 'quantity', value: parseInt(formData.quantity) + 1 } })} 
                    className="btn bg-pink-200 hover:bg-pink-300 text-gray-800 border-none ml-2"
                  >
                    +
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange} // Actualiza la cantidad y calcula el costo total
                    min="1"
                    className="hidden" // Oculta el input
                    required
                  />
                </div>
              </div>
              <div className="mb-4 text-white">
                <p>Costo total: ${totalCost} MXN</p> {/* Muestra el costo total */}
              </div>
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="btn mr-2 bg-pink-200 hover:bg-pink-300 text-gray-800 border-none"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn bg-pink-200 hover:bg-pink-300 text-gray-800 border-none"
                >
                  Comprar
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
                  <span className="inline-block mr-2">🎟</span>{organizer}
                </p>
      </div>
      
    </div>
  )
}
