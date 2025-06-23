import nodemailer from 'nodemailer';
import { logger } from '../config/logger';
import { prisma } from '../config/database';
import { EmailStatus, Priority } from '@prisma/client';

export interface EmailConfig {
  provider: 'smtp' | 'resend' | 'mailgun';
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  password?: string;
  apiKey?: string;
}

export interface SendEmailDto {
  to: string;
  toName?: string;
  subject: string;
  body: string;
  htmlBody?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: any[];
  clientId: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  async configureTransporter(config: EmailConfig) {
    try {
      if (config.provider === 'smtp') {
        this.transporter = nodemailer.createTransporter({
          host: config.host,
          port: config.port || 587,
          secure: config.secure || false,
          auth: {
            user: config.user,
            pass: config.password,
          },
        });
      } else if (config.provider === 'resend') {
        // TODO: Implement Resend integration
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.resend.com',
          port: 587,
          secure: false,
          auth: {
            user: 'resend',
            pass: config.apiKey,
          },
        });
      }

      // Verify connection
      if (this.transporter) {
        await this.transporter.verify();
        logger.info('Email transporter configured successfully');
      }
    } catch (error) {
      logger.error('Failed to configure email transporter:', error);
      throw error;
    }
  }

  async sendEmail(data: SendEmailDto): Promise<any> {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not configured');
      }

      const mailOptions = {
        from: `${process.env.SMTP_FROM_NAME || 'SupKVN'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: data.toName ? `${data.toName} <${data.to}>` : data.to,
        subject: data.subject,
        text: data.body,
        html: data.htmlBody || data.body,
        cc: data.cc,
        bcc: data.bcc,
        attachments: data.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);

      // Save sent email to database
      const savedEmail = await prisma.email.create({
        data: {
          subject: data.subject,
          body: data.body,
          htmlBody: data.htmlBody,
          fromEmail: mailOptions.from as string,
          fromName: process.env.SMTP_FROM_NAME || 'SupKVN',
          toEmail: data.to,
          toName: data.toName,
          ccEmails: data.cc || [],
          bccEmails: data.bcc || [],
          status: EmailStatus.RECEIVED, // Will be updated when we implement IMAP
          priority: Priority.MEDIUM,
          messageId: result.messageId,
          attachments: data.attachments ? JSON.stringify(data.attachments) : null,
          clientId: data.clientId,
        },
      });

      logger.info(`Email sent successfully: ${result.messageId}`);
      return { result, savedEmail };
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  async getEmails(clientId: string, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const [emails, total] = await Promise.all([
        prisma.email.findMany({
          where: { clientId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.email.count({
          where: { clientId },
        }),
      ]);

      return {
        emails,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get emails:', error);
      throw error;
    }
  }

  async getEmail(id: string, clientId: string) {
    try {
      const email = await prisma.email.findFirst({
        where: {
          id,
          clientId,
        },
      });

      if (!email) {
        throw new Error('Email not found');
      }

      // Mark as read if not already
      if (email.status === EmailStatus.RECEIVED) {
        await prisma.email.update({
          where: { id },
          data: { status: EmailStatus.READ },
        });
      }

      return email;
    } catch (error) {
      logger.error('Failed to get email:', error);
      throw error;
    }
  }

  async replyToEmail(emailId: string, clientId: string, replyData: Omit<SendEmailDto, 'clientId'>) {
    try {
      // Get original email
      const originalEmail = await this.getEmail(emailId, clientId);

      // Prepare reply
      const replySubject = originalEmail.subject.startsWith('Re:') 
        ? originalEmail.subject 
        : `Re: ${originalEmail.subject}`;

      const sendData: SendEmailDto = {
        ...replyData,
        to: originalEmail.fromEmail,
        toName: originalEmail.fromName || undefined,
        subject: replySubject,
        clientId,
      };

      // Send reply
      const result = await this.sendEmail(sendData);

      // Update original email status
      await prisma.email.update({
        where: { id: emailId },
        data: { status: EmailStatus.REPLIED },
      });

      logger.info(`Reply sent for email: ${emailId}`);
      return result;
    } catch (error) {
      logger.error('Failed to reply to email:', error);
      throw error;
    }
  }

  async deleteEmail(id: string, clientId: string) {
    try {
      const email = await prisma.email.update({
        where: {
          id,
          clientId,
        },
        data: {
          status: EmailStatus.DELETED,
        },
      });

      logger.info(`Email deleted: ${id}`);
      return email;
    } catch (error) {
      logger.error('Failed to delete email:', error);
      throw error;
    }
  }

  async archiveEmail(id: string, clientId: string) {
    try {
      const email = await prisma.email.update({
        where: {
          id,
          clientId,
        },
        data: {
          status: EmailStatus.ARCHIVED,
        },
      });

      logger.info(`Email archived: ${id}`);
      return email;
    } catch (error) {
      logger.error('Failed to archive email:', error);
      throw error;
    }
  }

  async getEmailStats(clientId: string) {
    try {
      const [total, unread, replied, archived, todayCount] = await Promise.all([
        prisma.email.count({
          where: { clientId },
        }),
        prisma.email.count({
          where: { 
            clientId, 
            status: { in: [EmailStatus.RECEIVED] }
          },
        }),
        prisma.email.count({
          where: { 
            clientId, 
            status: EmailStatus.REPLIED 
          },
        }),
        prisma.email.count({
          where: { 
            clientId, 
            status: EmailStatus.ARCHIVED 
          },
        }),
        prisma.email.count({
          where: {
            clientId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
      ]);

      return {
        total,
        unread,
        replied,
        archived,
        todayCount,
      };
    } catch (error) {
      logger.error('Failed to get email stats:', error);
      throw error;
    }
  }

  // TODO: Implement IMAP integration for receiving emails
  async setupIMAPConnection(config: any) {
    // This would integrate with IMAP to receive emails
    // Implementation would depend on specific requirements
    logger.info('IMAP integration not yet implemented');
  }
}

export const emailService = new EmailService();