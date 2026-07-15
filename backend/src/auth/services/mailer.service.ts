import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('SMTP_USER') || 'edulumix@gmail.com',
        pass: this.configService.get<string>('SMTP_PASS') || 'dngk mquc oxsz orws',
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }

  private getRoleLabel(role: string): string {
    const roles: Record<string, string> = {
      job_poster: 'Job Contributor',
      resource_poster: 'Resource Contributor',
      blog_poster: 'Blog Contributor',
      tech_blog_poster: 'Tech Blog/Event Contributor',
      digital_product_poster: 'Digital Product Contributor',
      others: 'Contributor',
    };
    return roles[role] || role;
  }

  private getBaseTemplate(title: string, badgeText: string, badgeBg: string, badgeColor: string, contentHtml: string): string {
    return `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #f8fafc;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">EduLumix</h1>
          <p style="color: #bfdbfe; font-size: 14px; margin: 6px 0 0 0; font-weight: 500;">Career & Education Platform</p>
        </div>
        
        <!-- Body Container -->
        <div style="padding: 32px 24px; background-color: #ffffff;">
          <!-- Badge -->
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="display: inline-block; padding: 6px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-radius: 9999px; background-color: ${badgeBg}; color: ${badgeColor};">
              ${badgeText}
            </span>
          </div>

          <!-- Main Title -->
          <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">${title}</h2>
          
          <!-- Content -->
          <div style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            ${contentHtml}
          </div>
          
          <div style="text-align: center; margin-top: 32px;">
            <a href="https://edulumix.in" style="display: inline-block; padding: 12px 32px; font-size: 14px; font-weight: 600; color: #ffffff; background-color: #2563eb; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
              Go to EduLumix
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="padding: 24px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0; line-height: 1.5;">
            Thank you for being part of our contributor network. If you have any questions, reach out to us at <a href="mailto:support@edulumix.in" style="color: #2563eb; text-decoration: none; font-weight: 500;">support@edulumix.in</a>.
          </p>
          <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 16px 0;" />
          <p style="color: #94a3b8; font-size: 11px; margin: 0;">
            &copy; 2026 EduLumix. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const htmlContent = `
      <p style="margin: 0 0 16px 0; text-align: center;">Verify your email address to complete your contributor account registration request.</p>
      <div style="padding: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; margin-bottom: 16px;">
        <p style="color: #475569; font-size: 14px; font-weight: 500; margin: 0 0 8px 0;">Your 6-digit email verification OTP is:</p>
        <h1 style="color: #2563eb; font-size: 38px; font-weight: 800; letter-spacing: 6px; margin: 0; font-family: monospace;">${otp}</h1>
        <p style="color: #ef4444; font-size: 12px; font-weight: 500; margin: 8px 0 0 0;">This OTP will automatically expire in 5 minutes.</p>
      </div>
      <p style="color: #64748b; font-size: 13px; margin: 0; text-align: center;">
        If you did not initiate this request, please safely ignore this email.
      </p>
    `;

    const mailOptions = {
      from: `"EduLumix" <${this.configService.get<string>('SMTP_USER') || 'edulumix@gmail.com'}>`,
      to: email,
      subject: 'Email Verification OTP - EduLumix',
      html: this.getBaseTemplate('Verify Your Email', 'Verification Needed', '#fef3c7', '#d97706', htmlContent),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send verification email. Please check SMTP configuration.');
    }
  }

  async sendRegistrationPendingEmail(email: string, name: string, role: string): Promise<void> {
    const roleLabel = this.getRoleLabel(role);
    const htmlContent = `
      <p style="margin: 0 0 16px 0;">Hi <strong>${name}</strong>,</p>
      <p style="margin: 0 0 16px 0;">Thank you for registering to become a contributor at EduLumix! We are excited to have you on board.</p>
      <div style="padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Role Requested:</td>
            <td style="padding: 6px 0; color: #1e293b; font-weight: 600; text-align: right;">${roleLabel}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Account Status:</td>
            <td style="padding: 6px 0; color: #d97706; font-weight: 600; text-align: right;">Pending Admin Approval</td>
          </tr>
        </table>
      </div>
      <p style="margin: 0;">Our team will review your application details. Once the super admin approves your request, you will receive a welcome email notification enabling you to log in, share resources, and start earning rewards.</p>
    `;

    const mailOptions = {
      from: `"EduLumix" <${this.configService.get<string>('SMTP_USER') || 'edulumix@gmail.com'}>`,
      to: email,
      subject: 'Contributor Application Received - EduLumix',
      html: this.getBaseTemplate('Application Received', 'Under Review', '#fef3c7', '#d97706', htmlContent),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending registration pending email:', error);
    }
  }

  async sendAccountApprovedEmail(email: string, name: string): Promise<void> {
    const htmlContent = `
      <p style="margin: 0 0 16px 0;">Hi <strong>${name}</strong>,</p>
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #15803d; font-weight: 600;">Congratulations! Your contributor account application has been approved.</p>
      <p style="margin: 0 0 16px 0;">Your account is now fully active. You can log in to the EduLumix platform to write blogs, post job openings, share resources, or upload courses, all while earning points that can be redeemed for real money.</p>
      <div style="padding: 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; text-align: center; color: #15803d; font-weight: 500; margin-bottom: 16px;">
        🌟 Start your journey today and earn rewards for every contribution!
      </div>
    `;

    const mailOptions = {
      from: `"EduLumix" <${this.configService.get<string>('SMTP_USER') || 'edulumix@gmail.com'}>`,
      to: email,
      subject: 'Welcome to EduLumix! Account Approved 🎉',
      html: this.getBaseTemplate('Welcome to EduLumix!', 'Approved', '#dcfce7', '#15803d', htmlContent),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending account approved email:', error);
    }
  }

  async sendAccountBlockedEmail(email: string, name: string): Promise<void> {
    const htmlContent = `
      <p style="margin: 0 0 16px 0;">Hi <strong>${name}</strong>,</p>
      <p style="margin: 0 0 16px 0;">This email is to notify you that your contributor account at EduLumix has been blocked by the administration.</p>
      <p style="margin: 0 0 16px 0; color: #991b1b; font-weight: 500;">During this period, you will not be able to log in, make new posts, or claim reward payouts.</p>
      <p style="margin: 0;">If you believe this action was taken in error or want to resolve this issue, please reply directly to this email or contact support at <a href="mailto:support@edulumix.in" style="color: #2563eb; text-decoration: none;">support@edulumix.in</a>.</p>
    `;

    const mailOptions = {
      from: `"EduLumix" <${this.configService.get<string>('SMTP_USER') || 'edulumix@gmail.com'}>`,
      to: email,
      subject: 'Account Suspended - EduLumix',
      html: this.getBaseTemplate('Account Blocked', 'Blocked', '#fee2e2', '#991b1b', htmlContent),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending account blocked email:', error);
    }
  }

  async sendAccountUnblockedEmail(email: string, name: string): Promise<void> {
    const htmlContent = `
      <p style="margin: 0 0 16px 0;">Hi <strong>${name}</strong>,</p>
      <p style="margin: 0 0 16px 0; color: #15803d; font-weight: 600;">Good news! Your EduLumix contributor account has been reactivated.</p>
      <p style="margin: 0 0 16px 0;">The block on your account has been lifted. You can log in normally to manage your posts, continue earning reward points, and claim payouts.</p>
      <p style="margin: 0;">Thank you for your patience and understanding.</p>
    `;

    const mailOptions = {
      from: `"EduLumix" <${this.configService.get<string>('SMTP_USER') || 'edulumix@gmail.com'}>`,
      to: email,
      subject: 'Account Reactivated - EduLumix',
      html: this.getBaseTemplate('Account Active', 'Activated', '#dcfce7', '#15803d', htmlContent),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending account unblocked email:', error);
    }
  }

  async sendClaimSubmittedEmail(email: string, name: string, points: number, amount: number, paymentMethod: string, paymentDetails: string): Promise<void> {
    const htmlContent = `
      <p style="margin: 0 0 16px 0;">Hi <strong>${name}</strong>,</p>
      <p style="margin: 0 0 16px 0;">We have received your reward redemption claim request. Our team will verify your contributions and process the payment shortly.</p>
      <div style="padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px;">
        <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #1e293b; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Claim Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Milestone Redeemed:</td>
            <td style="padding: 6px 0; color: #1e293b; font-weight: 600; text-align: right;">${points} Points</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Reward Value:</td>
            <td style="padding: 6px 0; color: #15803d; font-weight: 700; text-align: right;">₹${amount}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Payment Method:</td>
            <td style="padding: 6px 0; color: #1e293b; font-weight: 600; text-align: right;">${paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">UPI ID details:</td>
            <td style="padding: 6px 0; color: #1e293b; font-weight: 600; text-align: right; word-break: break-all;">${paymentDetails}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Claim Status:</td>
            <td style="padding: 6px 0; color: #d97706; font-weight: 600; text-align: right;">Pending Processing</td>
          </tr>
        </table>
      </div>
      <p style="margin: 0;">Once the payment is approved and released by the super admin, you will receive a payment confirmation email containing your transaction details.</p>
    `;

    const mailOptions = {
      from: `"EduLumix" <${this.configService.get<string>('SMTP_USER') || 'edulumix@gmail.com'}>`,
      to: email,
      subject: 'Reward Claim Submitted - EduLumix',
      html: this.getBaseTemplate('Reward Redemption Request', 'Processing', '#fef3c7', '#d97706', htmlContent),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending claim submitted email:', error);
    }
  }

  async sendPaymentReleasedEmail(email: string, name: string, points: number, amount: number, transactionId: string): Promise<void> {
    const htmlContent = `
      <p style="margin: 0 0 16px 0;">Hi <strong>${name}</strong>,</p>
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #15803d; font-weight: 600;">Payment released successfully!</p>
      <p style="margin: 0 0 16px 0;">Your reward of <strong>₹${amount}</strong> for the redemption of <strong>${points} points</strong> has been successfully transferred to your registered payment destination.</p>
      <div style="padding: 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; margin-bottom: 16px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #15803d; font-weight: 500;">Amount Transferred:</td>
            <td style="padding: 6px 0; color: #15803d; font-weight: 700; text-align: right;">₹${amount}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #475569; font-weight: 500;">Points Redeemed:</td>
            <td style="padding: 6px 0; color: #1e293b; font-weight: 600; text-align: right;">${points} Points</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #475569; font-weight: 500;">Transaction Ref/ID:</td>
            <td style="padding: 6px 0; color: #1e293b; font-weight: 600; text-align: right; font-family: monospace; word-break: break-all;">${transactionId || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #475569; font-weight: 500;">Status:</td>
            <td style="padding: 6px 0; color: #15803d; font-weight: 700; text-align: right;">PAID / COMPLETED</td>
          </tr>
        </table>
      </div>
      <p style="margin: 0;">Please check your UPI / bank application to confirm receipt of the funds. Thank you for your amazing contributions to the EduLumix platform!</p>
    `;

    const mailOptions = {
      from: `"EduLumix" <${this.configService.get<string>('SMTP_USER') || 'edulumix@gmail.com'}>`,
      to: email,
      subject: 'Reward Payment Released! - EduLumix 💸',
      html: this.getBaseTemplate('Payment Confirmation', 'Paid', '#dcfce7', '#15803d', htmlContent),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending payment released email:', error);
    }
  }
}
