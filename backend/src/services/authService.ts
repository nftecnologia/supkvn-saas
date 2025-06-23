import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { redisClient } from '../config/redis';
import { logger } from '../config/logger';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserPayload {
  id: string;
  email: string;
  name: string;
}

class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private readonly REFRESH_TOKEN_EXPIRES = 60 * 60 * 24 * 30; // 30 days in seconds

  async register(email: string, password: string, name: string): Promise<{ user: UserPayload; tokens: AuthTokens }> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      logger.info(`User registered successfully: ${email}`);
      return { user, tokens };
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ user: UserPayload; tokens: AuthTokens }> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          isActive: true,
        },
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (!user.isActive) {
        throw new Error('Account is disabled');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Generate tokens
      const userPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      const tokens = await this.generateTokens(userPayload);

      logger.info(`User logged in successfully: ${email}`);
      return { user: userPayload, tokens };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET) as any;
      
      // Check if refresh token exists in Redis
      const storedToken = await redisClient.get(`refresh_token:${decoded.userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      logger.info(`Token refreshed for user: ${user.email}`);
      return tokens;
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      // Remove refresh token from Redis
      await redisClient.delete(`refresh_token:${userId}`);
      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true },
      });

      if (!user) {
        // Don't reveal if email exists or not
        logger.info(`Password reset requested for non-existent email: ${email}`);
        return;
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        this.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Store reset token in Redis (expires in 1 hour)
      await redisClient.set(`reset_token:${user.id}`, resetToken, 3600);

      // TODO: Send email with reset link
      // await emailService.sendPasswordReset(user.email, resetToken);

      logger.info(`Password reset requested for: ${email}`);
    } catch (error) {
      logger.error('Forgot password failed:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Verify reset token
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }

      // Check if token exists in Redis
      const storedToken = await redisClient.get(`reset_token:${decoded.userId}`);
      if (!storedToken || storedToken !== token) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user password
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword },
      });

      // Remove reset token
      await redisClient.delete(`reset_token:${decoded.userId}`);

      logger.info(`Password reset successfully for user: ${decoded.userId}`);
    } catch (error) {
      logger.error('Password reset failed:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<UserPayload> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return user;
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw error;
    }
  }

  private async generateTokens(user: UserPayload): Promise<AuthTokens> {
    // Generate access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      this.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Store refresh token in Redis
    await redisClient.set(
      `refresh_token:${user.id}`,
      refreshToken,
      this.REFRESH_TOKEN_EXPIRES
    );

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();