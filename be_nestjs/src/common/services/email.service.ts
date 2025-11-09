import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private emailUser: string;
  private emailPass: string;

  constructor(private configService: ConfigService) {
    // Loại bỏ dấu ngoặc kép và khoảng trắng thừa từ env variables
    // Sử dụng ConfigService để đọc biến môi trường
    const emailUserRaw = this.configService.get<string>('EMAIL_USER') || process.env.EMAIL_USER;
    const emailPassRaw = this.configService.get<string>('EMAIL_PASS') || process.env.EMAIL_PASS;
    
    this.emailUser = this.sanitizeEnvValue(emailUserRaw) || '';
    this.emailPass = this.sanitizeEnvValue(emailPassRaw) || '';

    // Debug: Log thông tin cấu hình (không hiển thị toàn bộ password)
    const configEmailUser = this.configService.get<string>('EMAIL_USER');
    const configEmailPass = this.configService.get<string>('EMAIL_PASS');
    const envEmailUser = process.env.EMAIL_USER;
    const envEmailPass = process.env.EMAIL_PASS;
    
    this.logger.log('=== Email Configuration Debug ===');
    this.logger.log(`EMAIL_USER from ConfigService: ${configEmailUser || 'MISSING'}`);
    this.logger.log(`EMAIL_USER from process.env: ${envEmailUser || 'MISSING'}`);
    this.logger.log(`EMAIL_USER sanitized: ${this.emailUser || 'MISSING'}`);
    this.logger.log(`EMAIL_PASS from ConfigService: ${configEmailPass ? 'EXISTS (' + configEmailPass.length + ' chars)' : 'MISSING'}`);
    this.logger.log(`EMAIL_PASS from process.env: ${envEmailPass ? 'EXISTS (' + envEmailPass.length + ' chars)' : 'MISSING'}`);
    this.logger.log(`EMAIL_PASS length: ${this.emailPass ? this.emailPass.length : 0} characters`);
    if (this.emailPass) {
      this.logger.log(`EMAIL_PASS preview: ${this.emailPass.substring(0, 4)}***${this.emailPass.substring(this.emailPass.length - 2)}`);
    }

    // Kiểm tra cấu hình email
    if (!this.emailUser || !this.emailPass) {
      this.logger.error('EMAIL_USER hoặc EMAIL_PASS chưa được cấu hình trong .env');
      this.logger.error('Vui lòng thêm vào file .env:');
      this.logger.error('EMAIL_USER=your-email@gmail.com');
      this.logger.error('EMAIL_PASS=your-16-character-app-password');
      this.logger.error('LƯU Ý: Không dùng dấu ngoặc kép trong file .env');
    } else {
      // Kiểm tra độ dài App Password
      if (this.emailPass.length !== 16) {
        this.logger.warn(`⚠️ CẢNH BÁO: App Password có ${this.emailPass.length} ký tự, nhưng phải có đúng 16 ký tự!`);
        this.logger.warn('Vui lòng kiểm tra lại App Password trong file .env');
      }
      
      this.logger.log(`✓ Email service đã được cấu hình với: ${this.emailUser}`);
    }

    // Cấu hình transporter cho Gmail với SMTP trực tiếp
    // Sử dụng SMTP config trực tiếp thay vì service: 'gmail' để tránh một số vấn đề
    const transporterConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for các port khác
      auth: {
        user: this.emailUser || 'your-email@gmail.com',
        pass: this.emailPass || 'your-app-password'
      },
      tls: {
        rejectUnauthorized: false // Bỏ qua lỗi certificate nếu cần
      }
    };
    
    // Log config được sử dụng (ẩn password)
    this.logger.log(`Transporter config - user: ${transporterConfig.auth.user}, pass length: ${transporterConfig.auth.pass.length}`);
    
    this.transporter = nodemailer.createTransport(transporterConfig);

    // Verify connection configuration
    // Tạm thời comment để tránh bị chặn ngay khi khởi động nếu có lỗi
    // Uncomment dòng dưới sau khi đã fix vấn đề authentication
    // this.verifyConnection();
  }

  /**
   * Loại bỏ dấu ngoặc kép và khoảng trắng thừa từ giá trị env
   * Ví dụ: "value" -> value, 'value' -> value, " value " -> value
   */
  private sanitizeEnvValue(value: string | undefined): string | undefined {
    if (!value) return undefined;
    return value.trim().replace(/^["']|["']$/g, '').trim();
  }

  private async verifyConnection() {
    try {
      // Log thông tin đang sử dụng để verify
      this.logger.log(`Verifying SMTP connection với email: ${this.emailUser}`);
      await this.transporter.verify();
      this.logger.log('✓ SMTP connection verified successfully');
    } catch (error) {
      this.logger.error('✗ SMTP connection failed:', error.message);
      if (error.code === 'EAUTH') {
        this.logger.error('═══════════════════════════════════════════════════');
        this.logger.error('❌ LỖI XÁC THỰC GMAIL');
        this.logger.error('═══════════════════════════════════════════════════');
        this.logger.error(`Đang sử dụng email: ${this.emailUser || 'MISSING'}`);
        this.logger.error(`Độ dài password: ${this.emailPass ? this.emailPass.length : 0} ký tự`);
        if (this.emailPass) {
          this.logger.error(`Password preview: ${this.emailPass.substring(0, 4)}***${this.emailPass.substring(this.emailPass.length - 2)}`);
        }
        this.logger.error('');
        this.logger.error('Các bước khắc phục:');
        this.logger.error('');
        this.logger.error('1. Kiểm tra App Password có đúng không:');
        this.logger.error('   - Vào: https://myaccount.google.com/apppasswords');
        this.logger.error('   - Kiểm tra App Password còn hiệu lực không');
        this.logger.error('   - Nếu không chắc, XÓA App Password cũ và TẠO MỚI');
        this.logger.error('');
        this.logger.error('2. Đảm bảo đã bật 2-Step Verification:');
        this.logger.error('   - Vào: https://myaccount.google.com/security');
        this.logger.error('   - Bật "2-Step Verification" nếu chưa bật');
        this.logger.error('');
        this.logger.error('3. 🔴 QUAN TRỌNG: Gmail có thể đã CHẶN truy cập:');
        this.logger.error('   - Kiểm tra email Security Alert trong Gmail');
        this.logger.error('   - Vào: https://myaccount.google.com/notifications');
        this.logger.error('   - Xem "Recent security activity": https://myaccount.google.com/security');
        this.logger.error('   - Nếu có "Blocked sign-in attempt", click "Yes, that was me" để UNBLOCK');
        this.logger.error('');
        this.logger.error('4. Tạo App Password MỚI (SAU KHI ĐÃ UNBLOCK):');
        this.logger.error('   - Xóa TẤT CẢ App Password cũ: https://myaccount.google.com/apppasswords');
        this.logger.error('   - Tạo App Password mới');
        this.logger.error('   - Copy chính xác 16 ký tự (không có khoảng trắng)');
        this.logger.error('   - Cập nhật vào file .env');
        this.logger.error('   - Khởi động lại server');
        this.logger.error('═══════════════════════════════════════════════════');
        this.logger.error('Xem hướng dẫn chi tiết tại: EMAIL_SETUP.md');
      }
    }
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
      this.logger.log(`Email sent successfully to ${email}: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      this.logger.error('Error sending email:', error);
      
      // Xử lý các lỗi cụ thể
      if (error.code === 'EAUTH') {
        this.logger.error('═══════════════════════════════════════════════════');
        this.logger.error('❌ LỖI XÁC THỰC GMAIL KHI GỬI EMAIL');
        this.logger.error('═══════════════════════════════════════════════════');
        this.logger.error(`Email được sử dụng: ${this.emailUser || 'MISSING'}`);
        this.logger.error(`Độ dài password: ${this.emailPass ? this.emailPass.length : 0} ký tự`);
        if (this.emailPass) {
          this.logger.error(`Password preview: ${this.emailPass.substring(0, 4)}***${this.emailPass.substring(this.emailPass.length - 2)}`);
        }
        this.logger.error('');
        this.logger.error('🔴 QUAN TRỌNG: Có thể Gmail đã CHẶN truy cập do nhiều lần thử thất bại!');
        this.logger.error('');
        this.logger.error('BƯỚC 1: Kiểm tra Security Alerts trong Gmail');
        this.logger.error('   1. Vào Gmail: https://mail.google.com');
        this.logger.error('   2. Kiểm tra email Security Alert từ Google');
        this.logger.error('   3. Nếu có cảnh báo "Blocked sign-in attempt", click "Yes, that was me"');
        this.logger.error('   4. Hoặc vào: https://myaccount.google.com/notifications');
        this.logger.error('');
        this.logger.error('BƯỚC 2: Kiểm tra Recent Security Activity');
        this.logger.error('   1. Vào: https://myaccount.google.com/security');
        this.logger.error('   2. Scroll xuống "Recent security activity"');
        this.logger.error('   3. Tìm các "Blocked sign-in attempt" gần đây');
        this.logger.error('   4. Nếu có, click "Yes" để xác nhận đó là bạn');
        this.logger.error('');
        this.logger.error('BƯỚC 3: Tạo App Password MỚI (SAU KHI ĐÃ UNBLOCK)');
        this.logger.error('   1. Xóa TẤT CẢ App Password cũ: https://myaccount.google.com/apppasswords');
        this.logger.error('   2. Tạo App Password MỚI:');
        this.logger.error('      - App: Mail');
        this.logger.error('      - Device: Other (Custom name) → "Emo Nông Sản"');
        this.logger.error('   3. Copy password 16 ký tự (bỏ khoảng trắng)');
        this.logger.error('   4. Cập nhật vào file .env: EMAIL_PASS=xxxxyyyyzzzzaaaa');
        this.logger.error('   5. Khởi động lại server');
        this.logger.error('');
        this.logger.error('BƯỚC 4: Đảm bảo đã bật 2-Step Verification');
        this.logger.error('   - Kiểm tra: https://myaccount.google.com/security');
        this.logger.error('   - Phải bật "2-Step Verification" trước khi tạo App Password');
        this.logger.error('');
        this.logger.error('═══════════════════════════════════════════════════');
        throw new Error('Cấu hình email không đúng. Vui lòng kiểm tra EMAIL_USER và EMAIL_PASS trong file .env');
      }
      
      if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        throw new Error('Không thể kết nối đến Gmail server. Vui lòng kiểm tra kết nối mạng');
      }
      
      throw new Error(`Không thể gửi email: ${error.message}`);
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
      this.logger.log(`Welcome email sent successfully to ${email}: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      this.logger.error('Error sending welcome email:', error);
      // Không throw error cho welcome email vì không quan trọng
      return { success: false, error: error.message };
    }
  }
}
