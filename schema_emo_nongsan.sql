-- MySQL schema for "emo_ban_nong_san" (supports VNPAY test)
-- Charset: utf8mb4, Engine: InnoDB

CREATE DATABASE IF NOT EXISTS `emo_nongsan`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `emo_nongsan`;

-- Users & Auth --------------------------------------------------------------
-- Table `users`: thông tin tài khoản người dùng (local/google), vai trò, hồ sơ
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NULL,
  `full_name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(32) NULL,
  `avatar_url` VARCHAR(255) NULL,
  `role` ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  `provider` ENUM('local','google') NOT NULL DEFAULT 'local',
  `provider_id` VARCHAR(191) NULL,
  `email_verified_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `password_reset_tokens`: lưu token đặt lại mật khẩu qua email
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_reset_token` (`token`),
  CONSTRAINT `fk_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `addresses`: sổ địa chỉ giao hàng của người dùng
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `recipient_name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(32) NOT NULL,
  `province` VARCHAR(191) NOT NULL,
  `district` VARCHAR(191) NOT NULL,
  `ward` VARCHAR(191) NOT NULL,
  `address_line` VARCHAR(255) NOT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_addresses_user` (`user_id`),
  CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Catalog ------------------------------------------------------------------
-- Table `categories`: danh mục nhiều cấp cho sản phẩm
CREATE TABLE IF NOT EXISTS `categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` BIGINT UNSIGNED NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `position` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_slug` (`slug`),
  INDEX `idx_categories_parent` (`parent_id`),
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `products`: thông tin sản phẩm, thuộc danh mục, mô tả, nguồn gốc
CREATE TABLE IF NOT EXISTS `products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` BIGINT UNSIGNED NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `sku` VARCHAR(64) NULL,
  `description` TEXT NULL,
  `origin` VARCHAR(191) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_slug` (`slug`),
  INDEX `idx_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `product_images`: hình ảnh sản phẩm, thứ tự hiển thị
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `position` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_product_images_product` (`product_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `product_variants`: biến thể/khối lượng, giá, tồn kho của sản phẩm
CREATE TABLE IF NOT EXISTS `product_variants` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `variant_name` VARCHAR(191) NOT NULL, -- e.g., 500g, 1kg
  `unit_label` VARCHAR(64) NULL,        -- optional display label
  `price` DECIMAL(12,2) NOT NULL,
  `compare_at_price` DECIMAL(12,2) NULL,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  INDEX `idx_variants_product` (`product_id`),
  CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cart & Wishlist -----------------------------------------------------------
-- Table `carts`: giỏ hàng theo user hoặc session ẩn danh
CREATE TABLE IF NOT EXISTS `carts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `session_id` VARCHAR(191) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_carts_user` (`user_id`),
  INDEX `idx_carts_session` (`session_id`),
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `cart_items`: các dòng mặt hàng trong giỏ, snapshot đơn giá
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cart_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `variant_id` BIGINT UNSIGNED NULL,
  `quantity` INT NOT NULL,
  `unit_price_snapshot` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_cart_items_cart` (`cart_id`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_cart_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `wishlists`: danh sách yêu thích theo người dùng
CREATE TABLE IF NOT EXISTS `wishlists` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wishlist_user` (`user_id`),
  CONSTRAINT `fk_wishlists_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `wishlist_items`: các sản phẩm/biến thể được yêu thích
CREATE TABLE IF NOT EXISTS `wishlist_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `wishlist_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `variant_id` BIGINT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wishlist_item` (`wishlist_id`,`product_id`,`variant_id`),
  CONSTRAINT `fk_wishlist_items_wishlist` FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_items_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_wishlist_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Coupons & Promotions ------------------------------------------------------
-- Table `coupons`: mã giảm giá phần trăm/cố định, điều kiện và giới hạn
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(64) NOT NULL,
  `type` ENUM('PERCENT','FIXED') NOT NULL,
  `value` DECIMAL(12,2) NOT NULL,
  `min_order_amount` DECIMAL(12,2) NULL,
  `max_discount_amount` DECIMAL(12,2) NULL,
  `usage_limit` INT NULL,
  `used_count` INT NOT NULL DEFAULT 0,
  `starts_at` DATETIME NULL,
  `ends_at` DATETIME NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_coupons_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Orders -------------------------------------------------------------------
-- Table `orders`: đơn hàng, tổng tiền, phí ship, trạng thái xử lý & thanh toán
CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_code` VARCHAR(32) NOT NULL,
  `user_id` BIGINT UNSIGNED NULL,
  `status` ENUM('PENDING','CONFIRMED','PREPARING','SHIPPING','COMPLETED','CANCELLED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `payment_status` ENUM('UNPAID','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'UNPAID',
  `payment_method` ENUM('COD','VNPAY') NOT NULL DEFAULT 'VNPAY',
  `subtotal_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `discount_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `shipping_fee` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `shipping_address_snapshot` JSON NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_orders_code` (`order_code`),
  INDEX `idx_orders_user` (`user_id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `order_items`: chi tiết dòng sản phẩm trong đơn, giá và số lượng
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `variant_id` BIGINT UNSIGNED NULL,
  `product_name` VARCHAR(191) NOT NULL,
  `variant_name` VARCHAR(191) NULL,
  `sku` VARCHAR(64) NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(12,2) NOT NULL,
  `total_price` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_order_items_order` (`order_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_order_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payments & VNPAY ----------------------------------------------------------
-- Table `payments`: thanh toán của đơn hàng, trạng thái và số tiền
CREATE TABLE IF NOT EXISTS `payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `provider` ENUM('VNPAY','COD') NOT NULL DEFAULT 'VNPAY',
  `amount` DECIMAL(12,2) NOT NULL,
  `currency` CHAR(3) NOT NULL DEFAULT 'VND',
  `status` ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `paid_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payments_order` (`order_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `vnpay_transactions`: log callback/return IPN từ VNPAY, phục vụ đối soát
CREATE TABLE IF NOT EXISTS `vnpay_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `payment_id` BIGINT UNSIGNED NOT NULL,
  `vnp_TxnRef` VARCHAR(64) NOT NULL,
  `vnp_TransactionNo` VARCHAR(64) NULL,
  `vnp_Amount` BIGINT NULL, -- amount in VND * 100 (per spec)
  `vnp_BankCode` VARCHAR(32) NULL,
  `vnp_ResponseCode` VARCHAR(16) NULL,
  `vnp_OrderInfo` VARCHAR(255) NULL,
  `vnp_PayDate` VARCHAR(14) NULL, -- yyyyMMddHHmmss
  `vnp_SecureHash` VARCHAR(255) NULL,
  `return_params_raw` TEXT NULL,
  `ipn_params_raw` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_vnpay_payment` (`payment_id`),
  INDEX `idx_vnpay_txnref` (`vnp_TxnRef`),
  CONSTRAINT `fk_vnpay_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reviews ------------------------------------------------------------------
-- Table `reviews`: đánh giá sản phẩm, xếp hạng sao, nội dung, duyệt hiển thị
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `order_id` BIGINT UNSIGNED NULL,
  `rating` TINYINT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment` TEXT NULL,
  `images_json` JSON NULL,
  `is_approved` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_reviews_product` (`product_id`),
  INDEX `idx_reviews_user` (`user_id`),
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Settings & Simple Shipping Config ----------------------------------------
-- Table `settings`: cặp key-value cấu hình hệ thống (VNPAY, phí ship, tiền tệ...)
CREATE TABLE IF NOT EXISTS `settings` (
  `key` VARCHAR(128) NOT NULL,
  `value` TEXT NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- SAMPLE DATA - Dữ liệu mẫu cho Emo Nông Sản
-- ============================================================================

-- Insert Sample User
INSERT INTO users (email, password_hash, full_name, phone, role, provider) VALUES
('admin@emonongsan.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq', 'Admin Emo Nông Sản', '0123456789', 'admin', 'local'),
('customer@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq', 'Khách Hàng Mẫu', '0987654321', 'customer', 'local');

-- Insert Categories
INSERT INTO categories (name, slug, description, is_active, position) VALUES
('Rau Củ', 'rau-cu', 'Các loại rau củ tươi ngon từ trang trại địa phương', true, 1),
('Trái Cây', 'trai-cay', 'Trái cây theo mùa, ngọt ngào và bổ dưỡng', true, 2),
('Đặc Sản', 'dac-san', 'Đặc sản địa phương độc đáo', true, 3),
('Hữu Cơ', 'huu-co', 'Sản phẩm hữu cơ 100% tự nhiên', true, 4),
('Gia Vị', 'gia-vi', 'Gia vị và thảo mộc tươi', true, 5);

-- Insert Products
INSERT INTO products (category_id, name, slug, sku, description, origin, is_active) VALUES
-- Rau Củ
(1, 'Rau Muống Tươi', 'rau-muong-tuoi', 'RM001', 'Rau muống tươi ngon, giòn ngọt', 'Đồng bằng sông Cửu Long', true),
(1, 'Cà Chua Cherry', 'ca-chua-cherry', 'CC001', 'Cà chua cherry ngọt ngào, giàu vitamin', 'Lâm Đồng', true),
(1, 'Cà Rốt Baby', 'ca-rot-baby', 'CR001', 'Cà rốt baby ngọt ngào, giàu beta-carotene', 'Đà Lạt', true),
(1, 'Bắp Cải Tím', 'bap-cai-tim', 'BC001', 'Bắp cải tím giòn ngọt, giàu chất chống oxy hóa', 'Mộc Châu', true),
(1, 'Khoai Tây Tươi', 'khoai-tay-tuoi', 'KT001', 'Khoai tây tươi ngon, giàu tinh bột', 'Tây Nguyên', true),

-- Trái Cây
(2, 'Xoài Cát Hòa Lộc', 'xoai-cat-hoa-loc', 'XC001', 'Xoài cát Hòa Lộc ngọt ngào, thơm ngon', 'Tiền Giang', true),
(2, 'Cam Sành', 'cam-sanh', 'CS001', 'Cam sành ngọt ngào, giàu vitamin C', 'Vĩnh Long', true),
(2, 'Chuối Sứ', 'chuoi-su', 'CH001', 'Chuối sứ thơm ngon, giàu kali', 'Bến Tre', true),
(2, 'Dưa Hấu Ruột Đỏ', 'dua-hau-ruot-do', 'DH001', 'Dưa hấu ruột đỏ ngọt mát', 'An Giang', true),
(2, 'Ổi Nữ Hoàng', 'oi-nu-hoang', 'ON001', 'Ổi nữ hoàng giòn ngọt, giàu vitamin', 'Bình Dương', true),

-- Đặc Sản
(3, 'Cà Phê Arabica', 'ca-phe-arabica', 'CP001', 'Cà phê Arabica thơm ngon, đậm đà', 'Buôn Ma Thuột', true),
(3, 'Mật Ong Rừng', 'mat-ong-rung', 'MO001', 'Mật ong rừng nguyên chất, thơm ngon', 'Tây Nguyên', true),
(3, 'Hạt Điều Rang Muối', 'hat-dieu-rang-muoi', 'HD001', 'Hạt điều rang muối giòn ngon', 'Bình Phước', true),
(3, 'Trà Ô Long', 'tra-o-long', 'TO001', 'Trà Ô Long thơm ngon, thanh mát', 'Lâm Đồng', true),
(3, 'Tiêu Đen', 'tieu-den', 'TD001', 'Tiêu đen thơm cay, chất lượng cao', 'Châu Đức', true),

-- Hữu Cơ
(4, 'Rau Xà Lách Hữu Cơ', 'rau-xa-lach-huu-co', 'RX001', 'Rau xà lách hữu cơ 100% tự nhiên', 'Đà Lạt', true),
(4, 'Cà Chua Hữu Cơ', 'ca-chua-huu-co', 'CC002', 'Cà chua hữu cơ ngọt ngào, không hóa chất', 'Lâm Đồng', true),
(4, 'Dưa Leo Hữu Cơ', 'dua-leo-huu-co', 'DL001', 'Dưa leo hữu cơ giòn ngọt', 'Đà Lạt', true),
(4, 'Rau Thơm Hữu Cơ', 'rau-thom-huu-co', 'RT001', 'Rau thơm hữu cơ thơm ngon', 'Đà Lạt', true),
(4, 'Cải Bó Xôi Hữu Cơ', 'cai-bo-xoi-huu-co', 'CB001', 'Cải bó xôi hữu cơ giàu sắt', 'Đà Lạt', true),

-- Gia Vị
(5, 'Hành Tây Tươi', 'hanh-tay-tuoi', 'HT001', 'Hành tây tươi thơm ngon', 'Đà Lạt', true),
(5, 'Tỏi Tươi', 'toi-tuoi', 'TT001', 'Tỏi tươi thơm cay, chất lượng cao', 'Lý Sơn', true),
(5, 'Gừng Tươi', 'gung-tuoi', 'GT001', 'Gừng tươi thơm cay, tốt cho sức khỏe', 'Quảng Nam', true),
(5, 'Ớt Hiểm', 'ot-hiem', 'OH001', 'Ớt hiểm cay nồng, thơm ngon', 'Nghệ An', true),
(5, 'Rau Ngò', 'rau-ngo', 'RN001', 'Rau ngò thơm ngon, tươi mát', 'Đà Lạt', true);

-- Insert Product Images
INSERT INTO product_images (product_id, image_url, position) VALUES
-- Rau Muống
(1, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 1),
-- Cà Chua Cherry
(2, 'https://images.unsplash.com/photo-1592924357228-91f4fcb44e0c?w=400', 1),
-- Cà Rốt Baby
(3, 'https://images.unsplash.com/photo-1445282768818-728615cc910c?w=400', 1),
-- Bắp Cải Tím
(4, 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400', 1),
-- Khoai Tây
(5, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', 1),
-- Xoài
(6, 'https://images.unsplash.com/photo-1605027990121-4755d8b5a0b0?w=400', 1),
-- Cam Sành
(7, 'https://images.unsplash.com/photo-1557800634-7bf3a73b70c9?w=400', 1),
-- Chuối
(8, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', 1),
-- Dưa Hấu
(9, 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400', 1),
-- Ổi
(10, 'https://images.unsplash.com/photo-1605027990121-4755d8b5a0b0?w=400', 1),
-- Cà Phê
(11, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', 1),
-- Mật Ong
(12, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', 1),
-- Hạt Điều
(13, 'https://images.unsplash.com/photo-1605027990121-4755d8b5a0b0?w=400', 1),
-- Trà Ô Long
(14, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', 1),
-- Tiêu Đen
(15, 'https://images.unsplash.com/photo-1605027990121-4755d8b5a0b0?w=400', 1),
-- Rau Xà Lách Hữu Cơ
(16, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 1),
-- Cà Chua Hữu Cơ
(17, 'https://images.unsplash.com/photo-1592924357228-91f4fcb44e0c?w=400', 1),
-- Dưa Leo Hữu Cơ
(18, 'https://images.unsplash.com/photo-1445282768818-728615cc910c?w=400', 1),
-- Rau Thơm Hữu Cơ
(19, 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400', 1),
-- Cải Bó Xôi Hữu Cơ
(20, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', 1),
-- Hành Tây
(21, 'https://images.unsplash.com/photo-1605027990121-4755d8b5a0b0?w=400', 1),
-- Tỏi
(22, 'https://images.unsplash.com/photo-1557800634-7bf3a73b70c9?w=400', 1),
-- Gừng
(23, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', 1),
-- Ớt Hiểm
(24, 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400', 1),
-- Rau Ngò
(25, 'https://images.unsplash.com/photo-1605027990121-4755d8b5a0b0?w=400', 1);

-- Insert Product Variants
INSERT INTO product_variants (product_id, variant_name, unit_label, price, compare_at_price, stock_quantity, is_active) VALUES
-- Rau Muống (500g)
(1, 'Gói 500g', 'gói', 15000, 20000, 100, true),
-- Cà Chua Cherry (300g)
(2, 'Hộp 300g', 'hộp', 25000, 30000, 80, true),
-- Cà Rốt Baby (500g)
(3, 'Túi 500g', 'túi', 20000, 25000, 90, true),
-- Bắp Cải Tím (1kg)
(4, 'Cái 1kg', 'cái', 18000, 22000, 70, true),
-- Khoai Tây (1kg)
(5, 'Túi 1kg', 'túi', 12000, 15000, 120, true),
-- Xoài (1kg)
(6, 'Túi 1kg', 'túi', 35000, 40000, 60, true),
-- Cam Sành (1kg)
(7, 'Túi 1kg', 'túi', 30000, 35000, 75, true),
-- Chuối Sứ (1 nải)
(8, 'Nải 1kg', 'nải', 15000, 18000, 100, true),
-- Dưa Hấu (3kg)
(9, 'Quả 3kg', 'quả', 25000, 30000, 50, true),
-- Ổi Nữ Hoàng (1kg)
(10, 'Túi 1kg', 'túi', 20000, 25000, 85, true),
-- Cà Phê Arabica (250g)
(11, 'Gói 250g', 'gói', 80000, 100000, 40, true),
-- Mật Ong Rừng (500ml)
(12, 'Chai 500ml', 'chai', 120000, 150000, 30, true),
-- Hạt Điều (200g)
(13, 'Gói 200g', 'gói', 45000, 55000, 60, true),
-- Trà Ô Long (100g)
(14, 'Gói 100g', 'gói', 35000, 40000, 50, true),
-- Tiêu Đen (100g)
(15, 'Gói 100g', 'gói', 25000, 30000, 80, true),
-- Rau Xà Lách Hữu Cơ (200g)
(16, 'Gói 200g', 'gói', 18000, 22000, 70, true),
-- Cà Chua Hữu Cơ (300g)
(17, 'Hộp 300g', 'hộp', 30000, 35000, 60, true),
-- Dưa Leo Hữu Cơ (500g)
(18, 'Túi 500g', 'túi', 22000, 26000, 80, true),
-- Rau Thơm Hữu Cơ (100g)
(19, 'Bó 100g', 'bó', 15000, 18000, 90, true),
-- Cải Bó Xôi Hữu Cơ (200g)
(20, 'Bó 200g', 'bó', 20000, 24000, 75, true),
-- Hành Tây (500g)
(21, 'Túi 500g', 'túi', 12000, 15000, 100, true),
-- Tỏi (200g)
(22, 'Túi 200g', 'túi', 18000, 22000, 85, true),
-- Gừng (300g)
(23, 'Túi 300g', 'túi', 15000, 18000, 90, true),
-- Ớt Hiểm (100g)
(24, 'Túi 100g', 'túi', 10000, 12000, 95, true),
-- Rau Ngò (100g)
(25, 'Bó 100g', 'bó', 8000, 10000, 110, true);

-- Insert Sample Reviews
INSERT INTO reviews (user_id, product_id, rating, comment, is_approved) VALUES
(1, 1, 5, 'Rau muống rất tươi ngon, giòn ngọt!', true),
(1, 2, 4, 'Cà chua cherry ngọt ngào, chất lượng tốt', true),
(1, 6, 5, 'Xoài cát Hòa Lộc thơm ngon, đúng chuẩn', true),
(1, 11, 5, 'Cà phê Arabica đậm đà, thơm ngon', true),
(1, 16, 4, 'Rau hữu cơ tươi ngon, an toàn', true);

-- Insert Sample Settings
INSERT INTO settings (`key`, `value`) VALUES
('shipping_fee', '20000'),
('currency', 'VND'),
('site_name', 'Emo Nông Sản'),
('site_description', 'Website bán nông sản địa phương tươi ngon'),
('contact_email', 'info@emonongsan.com'),
('contact_phone', '0123 456 789'),
('contact_address', '123 Đường ABC, Quận XYZ, TP.HCM');