# Hướng dẫn Setup Google OAuth cho Emo Nông Sản

## Bước 1: Tạo Google OAuth App

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Chọn **Web application**
6. Cấu hình:
   - **Name**: Emo Nông Sản
   - **Authorized JavaScript origins**: 
     - `http://localhost:3001` (Frontend)
     - `http://localhost:3000` (Backend)
   - **Authorized redirect URIs**:
     - `http://localhost:3001/auth/google/callback`

## Bước 2: Cấu hình Environment Variables

### Backend (.env.local)
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Frontend (.env)
```env
VITE_GOOGLE_CLIENT_ID="your-google-client-id"
```

## Bước 3: Test Google OAuth

1. Chạy backend: `cd be_nextjs && npm run dev`
2. Chạy frontend: `cd fe_reactjs && npm run dev`
3. Truy cập `http://localhost:3001/login`
4. Click "Đăng nhập với Google"
5. Chọn tài khoản Google và authorize

## Lưu ý quan trọng

- Đảm bảo domain được thêm vào **Authorized JavaScript origins**
- Google OAuth chỉ hoạt động trên HTTPS trong production
- Cần cấu hình domain production trong Google Console khi deploy

## Troubleshooting

### Lỗi "This app isn't verified"
- Thêm domain vào **Authorized JavaScript origins**
- Kiểm tra Client ID có đúng không

### Lỗi "redirect_uri_mismatch"
- Kiểm tra redirect URI trong Google Console
- Đảm bảo URI khớp chính xác

### Lỗi CORS
- Kiểm tra cấu hình CORS trong backend
- Đảm bảo frontend URL được allow
