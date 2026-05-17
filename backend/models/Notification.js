import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If null, it's a global announcement
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['quiz_reminder', 'new_chapter', 'announcement', 'weak_topic_suggestion', 'daily_challenge'], required: true },
  read: { type: Boolean, default: false },
  linkUrl: { type: String } // Deep link to the relevant app section
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
