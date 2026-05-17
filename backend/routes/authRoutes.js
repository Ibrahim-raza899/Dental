import express from 'express';
import { registerUser, loginUser, verifyOtp, getProfile, updateProfile, forgotPassword, resetPassword, resendVerification } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
