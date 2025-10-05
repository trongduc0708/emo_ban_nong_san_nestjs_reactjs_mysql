# Hướng dẫn cấu hình Email Service cho Emo Nông Sản

## 1. Cấu hình Gmail App Password

### Bước 1: Bật 2-Factor Authentication
1. Truy cập [Google Account Security](https://myaccount.google.com/security)
2. Bật "2-Step Verification" nếu chưa bật

### Bước 2: Tạo App Password
1. Vào "App passwords" trong phần Security
2. Chọn "Mail" và "Other (Custom name)"
3. Nhập tên: "Emo Nông Sản"
4. Copy App Password được tạo (16 ký tự)

## 2. Cấu hình Environment Variables

Thêm vào file `.env` trong thư mục `be_nestjs`:

```env
# Email Configuration
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-16-character-app-password"
EMAIL_FROM="Emo Nông Sản <noreply@emonongsan.com>"
FRONTEND_URL="http://localhost:3001"
```

## 3. Test Email Service

### Development Mode
Trong development, email sẽ được log ra console với token reset password:
```
Reset password token for user@example.com: abc123...
Reset URL: http://localhost:3001/reset-password?token=abc123...
```

### Production Mode
Trong production, email sẽ được gửi thực tế đến người dùng.

## 4. Các Provider Email Khác

### Outlook/Hotmail
```typescript
this.transporter = nodemailer.createTransporter({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### SendGrid
```typescript
this.transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

### Mailgun
```typescript
this.transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILGUN_SMTP_USER,
    pass: process.env.MAILGUN_SMTP_PASS
  }
});
```

## 5. Troubleshooting

### Lỗi "Invalid login"
- Kiểm tra email và app password
- Đảm bảo đã bật 2FA
- Kiểm tra app password có đúng 16 ký tự

### Lỗi "Connection timeout"
- Kiểm tra firewall
- Thử port 465 với secure: true
- Kiểm tra network connection

### Email không được gửi
- Kiểm tra logs trong console
- Verify email configuration
- Test với email khác

## 6. Security Notes

- Không commit file .env
- Sử dụng App Password thay vì mật khẩu chính
- Giới hạn quyền truy cập email account
- Monitor email sending logs
