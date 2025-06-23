import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { logger } from '../config/logger';

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;
      
      const result = await authService.register(email, password, name);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      
      if (error.message === 'User already exists with this email') {
        return res.status(409).json({
          error: 'Email already registered',
          code: 'EMAIL_EXISTS',
        });
      }
      
      res.status(500).json({
        error: 'Registration failed',
        code: 'REGISTRATION_ERROR',
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      const result = await authService.login(email, password);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      
      if (error.message === 'Invalid credentials' || error.message === 'Account is disabled') {
        return res.status(401).json({
          error: error.message,
          code: 'INVALID_CREDENTIALS',
        });
      }
      
      res.status(500).json({
        error: 'Login failed',
        code: 'LOGIN_ERROR',
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      const tokens = await authService.refreshToken(refreshToken);
      
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: { tokens },
      });
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      
      res.status(401).json({
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          error: 'User not authenticated',
          code: 'NOT_AUTHENTICATED',
        });
      }
      
      await authService.logout(userId);
      
      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error: any) {
      logger.error('Logout error:', error);
      
      res.status(500).json({
        error: 'Logout failed',
        code: 'LOGOUT_ERROR',
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      await authService.forgotPassword(email);
      
      // Always return success for security reasons
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
    } catch (error: any) {
      logger.error('Forgot password error:', error);
      
      // Always return success for security reasons
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;
      
      await authService.resetPassword(token, password);
      
      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error: any) {
      logger.error('Password reset error:', error);
      
      res.status(400).json({
        error: 'Invalid or expired reset token',
        code: 'INVALID_RESET_TOKEN',
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          error: 'User not authenticated',
          code: 'NOT_AUTHENTICATED',
        });
      }
      
      res.json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      logger.error('Get profile error:', error);
      
      res.status(500).json({
        error: 'Failed to get profile',
        code: 'PROFILE_ERROR',
      });
    }
  }
}

export const authController = new AuthController();