import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validate, authSchemas } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for sensitive operations
  message: {
    error: 'Too many attempts, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', 
  authLimiter,
  validate(authSchemas.register),
  authController.register
);

router.post('/login',
  authLimiter,
  validate(authSchemas.login),
  authController.login
);

router.post('/refresh-token',
  authLimiter,
  validate(authSchemas.refreshToken),
  authController.refreshToken
);

router.post('/forgot-password',
  strictAuthLimiter,
  validate(authSchemas.forgotPassword),
  authController.forgotPassword
);

router.post('/reset-password',
  strictAuthLimiter,
  validate(authSchemas.resetPassword),
  authController.resetPassword
);

// Protected routes
router.post('/logout',
  authenticate,
  authController.logout
);

router.get('/profile',
  authenticate,
  authController.getProfile
);

export { router as authRoutes };