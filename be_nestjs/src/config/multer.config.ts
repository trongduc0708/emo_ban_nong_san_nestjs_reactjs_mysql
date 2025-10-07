import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/avatars',
    filename: (req: any, file: any, callback: any) => {
      const userId = req.user?.id || 'unknown';
      const timestamp = Date.now();
      const fileExtName = extname(file.originalname);
      const fileName = `avatar_${userId}_${timestamp}${fileExtName}`;
      callback(null, fileName);
    },
  }),
  productStorage: diskStorage({
    destination: './uploads/products',
    filename: (req: any, file: any, callback: any) => {
      const productId = req.body?.productId || 'unknown';
      const timestamp = Date.now();
      const fileExtName = extname(file.originalname);
      const fileName = `product_${productId}_${timestamp}${fileExtName}`;
      callback(null, fileName);
    },
  }),
  fileFilter: (req: any, file: any, callback: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Chỉ được upload file ảnh'), false);
    }
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};
