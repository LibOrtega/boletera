"use client"

import { useState, useEffect } from 'react';

const Hero = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);

  const [eventsByMonth, setEventsByMonth] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const data = await res.json();
          const grouped = groupEventsByMonth(data);
          setEventsByMonth(grouped);
        } else {
          console.error('Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const groupEventsByMonth = (events) => {
    return events.reduce((acc, event) => {
      const date = new Date(event.date);
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(event);
      return acc;
    }, {});
  };

  const sortMonthYearGroups = (groupedEvents) => {
    return Object.entries(groupedEvents).sort((a, b) => {
      const dateA = new Date(a[0].split(' ').reverse().join(' '));
      const dateB = new Date(b[0].split(' ').reverse().join(' '));
      return dateA - dateB;
    });
  };

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleBuyClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setFormData({ name: '', email: '', phone: '' });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para procesar la compra
    console.log('Compra confirmada:', { event: selectedEvent, buyer: formData });
    handleCloseModal();
  };

  return (
    <section className="max-w-7xl mx-auto bg-base-100 text-base-content px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Buscar un show</h2>
      <div className="relative mb-8">
        <input
          type="text"
          placeholder="Ingresa el nombre del show o del organizador"
          className="w-full bg-base-200 text-base-content border border-base-300 rounded-md py-2 px-4 pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg className="absolute left-3 top-3 h-5 w-5 text-base-content opacity-60" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        {searchTerm && (
          <button
            className="absolute right-3 top-3 text-base-content opacity-60"
            onClick={() => setSearchTerm('')}
          >
            ✕
          </button>
        )}
      </div>

      {sortMonthYearGroups(eventsByMonth).map(([monthYear, monthEvents]) => (
        <div key={monthYear}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-6">{monthYear}</h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {monthEvents.map((event) => (
              <div key={event._id} className="bg-base-200 rounded-lg overflow-hidden shadow-md flex flex-col">
                <img src={event.image} alt={event.name} className="w-full h-48 object-cover" />
                <div className="p-4 flex-grow">
                  <p className="text-sm text-base-content opacity-60 mb-2">{event.date}</p>
                  <h3 className="text-lg font-bold mb-2">{event.name}</h3>
                  <p className="text-sm text-base-content opacity-60 mb-1">
                    <span className="inline-block mr-2">📍</span>{event.location}
                  </p>
                  <p className="text-sm text-base-content opacity-60 mb-4">
                    <span className="inline-block mr-2">🎟️</span>{event.organizer}
                  </p>
                  <button className="btn btn-primary w-full" onClick={() => handleBuyClick(event)}>Comprar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Confirmar Compra</h2>
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
              <div className="flex justify-end">
                <button type="button" onClick={handleCloseModal} className="btn btn-ghost mr-2">Cancelar</button>
                <button type="submit" className="btn btn-primary">Confirmar Compra</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
