import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Cấu hình transporter cho Gmail (có thể thay đổi cho provider khác)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
  }

  async sendPasswordResetEmail(email: string, token: string, fullName: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Emo Nông Sản <noreply@emonongsan.com>',
      to: email,
      subject: 'Đặt lại mật khẩu - Emo Nông Sản',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 20px; border-radius: 10px;">
              <h1 style="margin: 0; font-size: 24px;">Emo Nông Sản</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Website bán nông sản địa phương</p>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Xin chào ${fullName}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
              Nhấn vào nút bên dưới để đặt lại mật khẩu mới.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #10b981, #3b82f6); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                Đặt lại mật khẩu
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
              Link này sẽ hết hạn sau 15 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, 
              vui lòng bỏ qua email này.
            </p>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px;">
            <p>Nếu nút không hoạt động, bạn có thể copy và paste link này vào trình duyệt:</p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 5px; margin: 10px 0;">
              ${resetUrl}
            </p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>© 2024 Emo Nông Sản. Tất cả quyền được bảo lưu.</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Không thể gửi email');
    }
  }

  async sendWelcomeEmail(email: string, fullName: string) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Emo Nông Sản <noreply@emonongsan.com>',
      to: email,
      subject: 'Chào mừng đến với Emo Nông Sản!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 20px; border-radius: 10px;">
              <h1 style="margin: 0; font-size: 24px;">Emo Nông Sản</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Website bán nông sản địa phương</p>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Chào mừng ${fullName}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Cảm ơn bạn đã đăng ký tài khoản tại Emo Nông Sản. 
              Chúng tôi rất vui được phục vụ bạn với những sản phẩm nông sản tươi ngon nhất.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/products" 
                 style="background: linear-gradient(135deg, #10b981, #3b82f6); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                Bắt đầu mua sắm
              </a>
            </div>
          </div>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Không throw error cho welcome email vì không quan trọng
      return { success: false, error: error.message };
    }
  }
}
