# Hướng dẫn cấu hình Google OAuth

## Lỗi: redirect_uri_mismatch

Lỗi này xảy ra khi redirect URI trong code không khớp với redirect URI đã đăng ký trong Google Cloud Console.

## Các bước cấu hình

### 1. Xác định Redirect URI đang sử dụng

Backend đang sử dụng redirect URI mặc định:
```
http://localhost:3000/api/auth/google/callback
```

Nếu bạn đã set `GOOGLE_REDIRECT_URI` trong `.env`, hãy kiểm tra giá trị đó.

### 2. Cấu hình trong Google Cloud Console

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project của bạn
3. Vào **APIs & Services** > **Credentials**
4. Tìm OAuth 2.0 Client ID của bạn (Client ID: `752838919439-uol5dri7q1l9d4e92iec0pcglutc67l8`)
5. Click vào để chỉnh sửa
6. Trong phần **Authorized redirect URIs**, thêm chính xác:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
7. **Lưu ý quan trọng:**
   - URI phải khớp **chính xác** (không có dấu `/` thừa ở cuối)
   - Phải có `http://` hoặc `https://`
   - Phải có đầy đủ path: `/api/auth/google/callback`
   - Không có khoảng trắng

8. Click **Save**

### 3. Cấu hình Backend (.env)

Thêm vào file `.env` của backend (`be_nestjs/.env`):

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=752838919439-uol5dri7q1l9d4e92iec0pcglutc67l8.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret-here>
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

**Lưu ý:**
- `GOOGLE_CLIENT_SECRET`: Lấy từ Google Cloud Console (trong cùng trang với Client ID)
- `GOOGLE_REDIRECT_URI`: Phải khớp chính xác với URI đã đăng ký trong Google Console
- Nếu không set `GOOGLE_REDIRECT_URI`, hệ thống sẽ dùng mặc định: `http://localhost:3000/api/auth/google/callback`

### 4. Kiểm tra lại

1. Restart backend server
2. Kiểm tra console log khi click "Đăng nhập với Google" - sẽ thấy:
   ```
   === Google OAuth Debug ===
   Client ID: ...
   Redirect URI: ...
   Backend URL: ...
   ========================
   ```
3. Đảm bảo Redirect URI trong log khớp với URI trong Google Console

### 5. Production Setup

Khi deploy lên production, cần:

1. Thêm redirect URI production vào Google Console:
   ```
   https://yourdomain.com/api/auth/google/callback
   ```

2. Cập nhật `.env`:
   ```env
   GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
   BACKEND_URL=https://yourdomain.com
   FRONTEND_URL=https://your-frontend-domain.com
   ```

## Troubleshooting

### Vẫn bị lỗi redirect_uri_mismatch?

1. **Kiểm tra lại Google Console:**
   - Đảm bảo đã Save sau khi thêm redirect URI
   - Có thể mất vài phút để Google cập nhật

2. **Kiểm tra .env:**
   - Đảm bảo đã restart backend sau khi thay đổi .env
   - Kiểm tra không có khoảng trắng thừa

3. **Kiểm tra port:**
   - Đảm bảo backend đang chạy trên port 3000
   - Nếu dùng port khác, cập nhật `BACKEND_URL` và redirect URI

4. **Clear cache:**
   - Thử clear cache trình duyệt
   - Thử incognito/private mode

5. **Kiểm tra log:**
   - Xem console log của backend để biết redirect URI đang được sử dụng
   - So sánh với URI trong Google Console

## Test

Sau khi cấu hình xong:

1. Click "Đăng nhập với Google" trên trang login
2. Nếu redirect URI đúng, sẽ chuyển đến Google login page
3. Sau khi chọn tài khoản, sẽ redirect về backend callback
4. Backend xử lý và redirect về frontend với token
