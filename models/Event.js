import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  ubi:{
    type: String,
    required: true,
  },
  organizer: {
    type: String,
    required: true,
  },
 
});

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
