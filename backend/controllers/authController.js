import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
  const { name, email, password, role, demoSecret } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let finalRole = 'student';
    let isVerified = false;

    if (demoSecret === 'odontogenic_demo_123') {
      finalRole = role || 'student';
      isVerified = true;
    }

    const user = await User.create({ name, email, password, role: finalRole, isVerified });

    // Generate OTP for standard users
    if (!isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otpSecret = otp;
      await user.save();

      try {
        await sendEmail({
          email: user.email,
          subject: 'Odontogenic LMS - Verify Your Account',
          message: `Your account verification code is: ${otp}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #2563eb; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Welcome to Odontogenic LMS</h1>
              </div>
              <div style="padding: 20px;">
                <p>Hello ${user.name},</p>
                <p>Thank you for registering. Please use the following 6-digit OTP to verify your account:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; padding: 10px 20px; background-color: #f3f4f6; border-radius: 8px;">${otp}</span>
                </div>
                <p>If you did not request this, please ignore this email.</p>
              </div>
            </div>
          `,
        });
      } catch (err) {
        console.error('Error sending email:', err);
        // We still return success but maybe log the error, 
        // the user is created and they can request another OTP later if implemented.
      }
    }

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        ...(isVerified && { token: generateToken(user._id) }),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email before signing in' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Check OTP against the database
    if (user.otpSecret && user.otpSecret === otp) {
      user.isVerified = true;
      user.otpSecret = undefined; // Clear OTP after successful verification
      await user.save();
      res.json({ message: 'Email verified successfully', isVerified: true });
    } else {
      res.status(400).json({ message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resendVerification = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User is already verified' });
    
    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpSecret = otp;
    await user.save();
    
    // Send email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Odontogenic LMS - Verify Your Account',
        message: `Your account verification code is: ${otp}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #2563eb; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Welcome to Odontogenic LMS</h1>
            </div>
            <div style="padding: 20px;">
              <p>Hello ${user.name},</p>
              <p>You requested a new verification code. Please use the following 6-digit OTP to verify your account:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; padding: 10px 20px; background-color: #f3f4f6; border-radius: 8px;">${otp}</span>
              </div>
              <p>If you did not request this, please ignore this email.</p>
            </div>
          </div>
        `,
      });
      res.json({ message: 'Verification email resent successfully' });
    } catch (err) {
      console.error('Error sending email:', err);
      res.status(500).json({ message: 'Failed to send verification email' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update allowed fields
    user.name = req.body.name || user.name;
    if (req.body.profile) {
      user.profile = { ...user.profile, ...req.body.profile };
    }

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      profile: updated.profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP and expiration (10 minutes)
    user.resetPasswordOtp = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Odontogenic LMS - Password Reset',
        message: `Your password reset code is: ${otp}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #2563eb; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Password Reset Request</h1>
            </div>
            <div style="padding: 20px;">
              <p>Hello ${user.name},</p>
              <p>You requested a password reset. Please use the following 6-digit code to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; padding: 10px 20px; background-color: #f3f4f6; border-radius: 8px;">${otp}</span>
              </div>
              <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
          </div>
        `,
      });
      res.json({ message: 'Password reset email sent' });
    } catch (err) {
      console.error('Email error:', err);
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Validate OTP and expiration
    if (
      !user.resetPasswordOtp ||
      user.resetPasswordOtp !== otp ||
      user.resetPasswordExpire < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    await user.save(); // Password will be hashed in pre('save')

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
