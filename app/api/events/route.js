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
