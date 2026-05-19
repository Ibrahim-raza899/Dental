import mongoose from 'mongoose';
import User from './models/User.js';

const MONGO_URI = 'mongodb+srv://ibrahimraza899_db_user:dental123@odontolearn.8w2nufk.mongodb.net/odontogenic_db';

const seedUsers = async () => {
  try {
    console.log('Connecting to Live MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to Live MongoDB Atlas');

    const users = [
      {
        name: 'Ibrahim (Student)',
        email: 'ibrahimraza899@gmail.com',
        password: 'Ibrahim_104',
        role: 'student',
        isVerified: true
      },
      {
        name: 'Ibrahim (Faculty)',
        email: 'ibrahimraza3135@gmail.com',
        password: 'Ibrahim_104',
        role: 'faculty',
        isVerified: true
      }
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists. Updating to verified...`);
        existingUser.isVerified = true;
        existingUser.password = userData.password;
        await existingUser.save();
        console.log(`Updated user: ${userData.email}`);
      } else {
        await User.create(userData);
        console.log(`Created user: ${userData.email}`);
      }
    }

    console.log('Successfully injected custom users!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
