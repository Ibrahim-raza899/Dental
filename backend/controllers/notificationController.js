import Notification from '../models/Notification.js';

export const getMyNotifications = async (req, res) => {
  try {
    // Get personal notifications and global announcements (where userId is null)
    const notifications = await Notification.find({
      $or: [{ userId: req.user._id }, { userId: null }]
    }).sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification && (notification.userId.equals(req.user._id) || !notification.userId)) {
      notification.read = true;
      await notification.save();
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAnnouncement = async (req, res) => {
  // Only faculty can do this
  const { title, message, type, linkUrl } = req.body;
  try {
    const notification = new Notification({
      userId: null, // Global
      title,
      message,
      type,
      linkUrl
    });
    const createdNotification = await notification.save();
    res.status(201).json(createdNotification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
