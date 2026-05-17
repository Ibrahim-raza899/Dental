import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*(\+[\w-]+)?@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
  isVerified: { type: Boolean, default: false },
  mfaEnabled: { type: Boolean, default: false },
  otpSecret: { type: String }, // For 2FA/Email Verification
  resetPasswordOtp: String,
  resetPasswordExpire: Date,
  profile: {
    university: String,
    department: String,
    semester: Number,
    studentId: String,
    profilePicture: String,
    interests: [String],
  },
  progress: [{
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    read: { type: Boolean, default: false }
  }]
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
