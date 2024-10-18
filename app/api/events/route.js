import { NextResponse } from 'next/server';
import connectMongo from '@/libs/mongoose';
import Event from '@/models/Event';

export async function GET() {
  try {
    await connectMongo();
    const events = await Event.find({});
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching events' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const eventData = await request.json();
    
    // Aquí deberías agregar la lógica para guardar el evento en tu base de datos
    // Por ahora, solo simularemos una respuesta exitosa
    
    return NextResponse.json({ message: 'Evento creado exitosamente' }, { status: 201 });
  } catch (error) {
    console.error('Error al crear el evento:', error);
    return NextResponse.json({ error: 'Error al crear el evento' }, { status: 500 });
  }
}
