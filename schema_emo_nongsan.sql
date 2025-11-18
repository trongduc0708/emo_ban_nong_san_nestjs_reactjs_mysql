/*
 Navicat Premium Dump SQL

 Source Server         : mysq8
 Source Server Type    : MySQL
 Source Server Version : 100432 (10.4.32-MariaDB)
 Source Host           : localhost:3318
 Source Schema         : emo_nongsan

 Target Server Type    : MySQL
 Target Server Version : 100432 (10.4.32-MariaDB)
 File Encoding         : 65001

 Date: 24/10/2025 00:05:31
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for addresses
-- ----------------------------
DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `recipient_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `province` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `district` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ward` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address_line` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_addresses_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of addresses
-- ----------------------------
INSERT INTO `addresses` VALUES (1, 3, 'dsd', '0386693354', 'Hà Nội', 'Hai bà trương', 'sá', 'sá', 1, '2025-10-07 10:33:56', '2025-10-07 10:33:56');

-- ----------------------------
-- Table structure for cart_items
-- ----------------------------
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `cart_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `variant_id` bigint UNSIGNED NULL DEFAULT NULL,
  `quantity` int NOT NULL,
  `unit_price_snapshot` decimal(12, 2) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_cart_items_cart`(`cart_id` ASC) USING BTREE,
  INDEX `fk_cart_items_product`(`product_id` ASC) USING BTREE,
  INDEX `fk_cart_items_variant`(`variant_id` ASC) USING BTREE,
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_cart_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cart_items
-- ----------------------------
INSERT INTO `cart_items` VALUES (9, 1, 12, 12, 1, 120000.00);

-- ----------------------------
-- Table structure for carts
-- ----------------------------
DROP TABLE IF EXISTS `carts`;
CREATE TABLE `carts`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NULL DEFAULT NULL,
  `session_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_carts_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_carts_session`(`session_id` ASC) USING BTREE,
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of carts
-- ----------------------------
INSERT INTO `carts` VALUES (1, 3, NULL, '2025-10-07 08:50:39', '2025-10-07 08:50:39');
INSERT INTO `carts` VALUES (2, 1, NULL, '2025-10-13 13:33:15', '2025-10-13 13:33:15');

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` bigint UNSIGNED NULL DEFAULT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `position` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_categories_slug`(`slug` ASC) USING BTREE,
  INDEX `idx_categories_parent`(`parent_id` ASC) USING BTREE,
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES (1, NULL, 'Rau Củ', 'rau-cu', 'Các loại rau củ tươi ngon từ trang trại địa phương', 1, 1);
INSERT INTO `categories` VALUES (2, NULL, 'Trái Cây', 'trai-cay', 'Trái cây theo mùa, ngọt ngào và bổ dưỡng', 1, 2);
INSERT INTO `categories` VALUES (3, NULL, 'Đặc Sản', 'dac-san', 'Đặc sản địa phương độc đáo', 1, 3);
INSERT INTO `categories` VALUES (4, NULL, 'Hữu Cơ', 'huu-co', 'Sản phẩm hữu cơ 100% tự nhiên', 1, 4);
INSERT INTO `categories` VALUES (5, NULL, 'Gia Vị', 'gia-vi', 'Gia vị và thảo mộc tươi', 1, 5);

-- ----------------------------
-- Table structure for coupons
-- ----------------------------
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `type` enum('PERCENT','FIXED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `value` decimal(12, 2) NOT NULL,
  `min_order_amount` decimal(12, 2) NULL DEFAULT NULL,
  `max_discount_amount` decimal(12, 2) NULL DEFAULT NULL,
  `usage_limit` int NULL DEFAULT NULL,
  `used_count` int NOT NULL DEFAULT 0,
  `starts_at` datetime NULL DEFAULT NULL,
  `ends_at` datetime NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_coupons_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of coupons
-- ----------------------------
INSERT INTO `coupons` VALUES (1, 'SALE', 'PERCENT', 10.00, 1000.00, NULL, 20, 0, '2025-10-14 00:00:00', '2025-10-29 00:00:00', 1, '2025-10-13 16:50:50', '2025-10-13 17:02:04');

-- ----------------------------
-- Table structure for order_items
-- ----------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `variant_id` bigint UNSIGNED NULL DEFAULT NULL,
  `product_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `variant_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `sku` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(12, 2) NOT NULL,
  `total_price` decimal(12, 2) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_order_items_order`(`order_id` ASC) USING BTREE,
  INDEX `fk_order_items_product`(`product_id` ASC) USING BTREE,
  INDEX `fk_order_items_variant`(`variant_id` ASC) USING BTREE,
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_order_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_items
-- ----------------------------
INSERT INTO `order_items` VALUES (1, 1, 2, NULL, 'Cà Chua Cherry', 'Hộp 300g', 'CC001', 4, 25000.00, 100000.00);
INSERT INTO `order_items` VALUES (2, 1, 1, 1, 'Rau Muống Tươi', 'Gói 500g', 'RM001', 1, 15000.00, 15000.00);
INSERT INTO `order_items` VALUES (3, 2, 1, 1, 'Rau Muống Tươi', 'Gói 500g', 'RM001', 1, 15000.00, 15000.00);
INSERT INTO `order_items` VALUES (4, 3, 3, 3, 'Cà Rốt Baby', 'Túi 500g', 'CR001', 9, 20000.00, 180000.00);
INSERT INTO `order_items` VALUES (5, 4, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 1, 120000.00, 120000.00);

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_id` bigint UNSIGNED NULL DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','PREPARING','SHIPPING','COMPLETED','CANCELLED','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'PENDING',
  `payment_status` enum('UNPAID','PAID','FAILED','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'UNPAID',
  `payment_method` enum('COD','VNPAY') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'VNPAY',
  `subtotal_amount` decimal(12, 2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(12, 2) NOT NULL DEFAULT 0.00,
  `shipping_fee` decimal(12, 2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12, 2) NOT NULL DEFAULT 0.00,
  `shipping_address_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_orders_code`(`order_code` ASC) USING BTREE,
  INDEX `idx_orders_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO `orders` VALUES (1, 'ORD-1759833395222-32d67c03l', 3, 'PENDING', 'UNPAID', 'COD', 0.00, 0.00, 0.00, 115000.00, NULL, '', '2025-10-07 10:36:35', '2025-10-07 10:36:35');
INSERT INTO `orders` VALUES (2, 'ORD-1759850045315-2ncbgrry3', 3, 'PENDING', 'REFUNDED', 'COD', 0.00, 0.00, 0.00, 15000.00, NULL, '', '2025-10-07 15:14:05', '2025-10-13 17:30:13');
INSERT INTO `orders` VALUES (3, 'ORD-1759850170865-guw0s5m66', 3, 'PENDING', 'FAILED', 'COD', 0.00, 0.00, 0.00, 180000.00, NULL, 'dadadada', '2025-10-07 15:16:10', '2025-10-13 17:30:08');
INSERT INTO `orders` VALUES (4, 'ORD-1759851767311-eszxuud9i', 3, 'SHIPPING', 'PAID', 'COD', 0.00, 0.00, 0.00, 120000.00, NULL, 'sâsa', '2025-10-07 15:42:47', '2025-10-13 17:29:58');

-- ----------------------------
-- Table structure for password_reset_tokens
-- ----------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_reset_token`(`token` ASC) USING BTREE,
  INDEX `fk_reset_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of password_reset_tokens
-- ----------------------------

-- ----------------------------
-- Table structure for payments
-- ----------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL,
  `provider` enum('VNPAY','COD') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'VNPAY',
  `amount` decimal(12, 2) NOT NULL,
  `currency` char(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'VND',
  `status` enum('PENDING','SUCCESS','FAILED','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'PENDING',
  `paid_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_payments_order`(`order_id` ASC) USING BTREE,
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of payments
-- ----------------------------

-- ----------------------------
-- Table structure for product_images
-- ----------------------------
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint UNSIGNED NOT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `position` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_product_images_product`(`product_id` ASC) USING BTREE,
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 28 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_images
-- ----------------------------
INSERT INTO `product_images` VALUES (1, 1, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 1);
INSERT INTO `product_images` VALUES (3, 3, 'https://images.unsplash.com/photo-1445282768818-728615cc910c?w=400', 1);
INSERT INTO `product_images` VALUES (4, 4, 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400', 1);
INSERT INTO `product_images` VALUES (5, 5, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', 1);
INSERT INTO `product_images` VALUES (6, 6, 'https://images.unsplash.com/photo-1605027990121-4755d8b5a0b0?w=400', 1);
INSERT INTO `product_images` VALUES (7, 7, 'https://images.unsplash.com/photo-1557800634-7bf3a73b70c9?w=400', 1);
INSERT INTO `product_images` VALUES (8, 8, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', 1);
INSERT INTO `product_images` VALUES (9, 9, 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400', 1);
INSERT INTO `product_images` VALUES (10, 10, 'https://images.unsplash.com/photo-1605027990121-4755d8b5a0b0?w=400', 1);
INSERT INTO `product_images` VALUES (11, 11, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', 1);
INSERT INTO `product_images` VALUES (12, 12, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', 1);
INSERT INTO `product_images` VALUES (13, 13, 'https://images.unsplash.com/photo-1605027990121-4755d8b5a0b0?w=400', 1);
INSERT INTO `product_images` VALUES (14, 14, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', 1);
INSERT INTO `product_images` VALUES (15, 15, 'https://images.unsplash.com/photo-1605027990121-4755d8b5a0b0?w=400', 1);
INSERT INTO `product_images` VALUES (16, 16, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 1);
INSERT INTO `product_images` VALUES (17, 17, 'https://images.unsplash.com/photo-1592924357228-91f4fcb44e0c?w=400', 1);
INSERT INTO `product_images` VALUES (18, 18, 'https://images.unsplash.com/photo-1445282768818-728615cc910c?w=400', 1);
INSERT INTO `product_images` VALUES (19, 19, 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400', 1);
INSERT INTO `product_images` VALUES (20, 20, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', 1);
INSERT INTO `product_images` VALUES (21, 21, 'https://images.unsplash.com/photo-1605027990121-4755d8b5a0b0?w=400', 1);
INSERT INTO `product_images` VALUES (22, 22, 'https://images.unsplash.com/photo-1557800634-7bf3a73b70c9?w=400', 1);
INSERT INTO `product_images` VALUES (23, 23, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', 1);
INSERT INTO `product_images` VALUES (24, 24, 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400', 1);
INSERT INTO `product_images` VALUES (25, 25, 'https://images.unsplash.com/photo-1605027990121-4755d8b5a0b0?w=400', 1);
INSERT INTO `product_images` VALUES (27, 2, '/uploads/products/product_unknown_1760366485063.jpg', 2);

-- ----------------------------
-- Table structure for product_variants
-- ----------------------------
DROP TABLE IF EXISTS `product_variants`;
CREATE TABLE `product_variants`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint UNSIGNED NOT NULL,
  `variant_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `unit_label` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `price` decimal(12, 2) NOT NULL,
  `compare_at_price` decimal(12, 2) NULL DEFAULT NULL,
  `stock_quantity` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_variants_product`(`product_id` ASC) USING BTREE,
  CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 29 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_variants
-- ----------------------------
INSERT INTO `product_variants` VALUES (1, 1, 'Gói 500g', 'gói', 15000.00, 20000.00, 98, 1);
INSERT INTO `product_variants` VALUES (3, 3, 'Túi 500g', 'túi', 20000.00, 25000.00, 81, 1);
INSERT INTO `product_variants` VALUES (4, 4, 'Cái 1kg', 'cái', 18000.00, 22000.00, 70, 1);
INSERT INTO `product_variants` VALUES (5, 5, 'Túi 1kg', 'túi', 12000.00, 15000.00, 120, 1);
INSERT INTO `product_variants` VALUES (6, 6, 'Túi 1kg', 'túi', 35000.00, 40000.00, 60, 1);
INSERT INTO `product_variants` VALUES (7, 7, 'Túi 1kg', 'túi', 30000.00, 35000.00, 75, 1);
INSERT INTO `product_variants` VALUES (8, 8, 'Nải 1kg', 'nải', 15000.00, 18000.00, 100, 1);
INSERT INTO `product_variants` VALUES (9, 9, 'Quả 3kg', 'quả', 25000.00, 30000.00, 50, 1);
INSERT INTO `product_variants` VALUES (10, 10, 'Túi 1kg', 'túi', 20000.00, 25000.00, 85, 1);
INSERT INTO `product_variants` VALUES (11, 11, 'Gói 250g', 'gói', 80000.00, 100000.00, 40, 1);
INSERT INTO `product_variants` VALUES (12, 12, 'Chai 500ml', 'chai', 120000.00, 150000.00, 29, 1);
INSERT INTO `product_variants` VALUES (13, 13, 'Gói 200g', 'gói', 45000.00, 55000.00, 60, 1);
INSERT INTO `product_variants` VALUES (14, 14, 'Gói 100g', 'gói', 35000.00, 40000.00, 50, 1);
INSERT INTO `product_variants` VALUES (15, 15, 'Gói 100g', 'gói', 25000.00, 30000.00, 80, 1);
INSERT INTO `product_variants` VALUES (16, 16, 'Gói 200g', 'gói', 18000.00, 22000.00, 70, 1);
INSERT INTO `product_variants` VALUES (17, 17, 'Hộp 300g', 'hộp', 30000.00, 35000.00, 60, 1);
INSERT INTO `product_variants` VALUES (18, 18, 'Túi 500g', 'túi', 22000.00, 26000.00, 80, 1);
INSERT INTO `product_variants` VALUES (19, 19, 'Bó 100g', 'bó', 15000.00, 18000.00, 90, 1);
INSERT INTO `product_variants` VALUES (20, 20, 'Bó 200g', 'bó', 20000.00, 24000.00, 75, 1);
INSERT INTO `product_variants` VALUES (21, 21, 'Túi 500g', 'túi', 12000.00, 15000.00, 100, 1);
INSERT INTO `product_variants` VALUES (22, 22, 'Túi 200g', 'túi', 18000.00, 22000.00, 85, 1);
INSERT INTO `product_variants` VALUES (23, 23, 'Túi 300g', 'túi', 15000.00, 18000.00, 90, 1);
INSERT INTO `product_variants` VALUES (24, 24, 'Túi 100g', 'túi', 10000.00, 12000.00, 95, 1);
INSERT INTO `product_variants` VALUES (25, 25, 'Bó 100g', 'bó', 8000.00, 10000.00, 110, 1);
INSERT INTO `product_variants` VALUES (27, 2, '1 quả', 'KG', 5000.00, 10000.00, 76, 1);
INSERT INTO `product_variants` VALUES (28, 2, '2', 'cái', 5000.00, 100000.00, 0, 1);

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` bigint UNSIGNED NULL DEFAULT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sku` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `origin` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_products_slug`(`slug` ASC) USING BTREE,
  INDEX `idx_products_category`(`category_id` ASC) USING BTREE,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 26 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES (1, 1, 'Rau Muống Tươi', 'rau-muong-tuoi', 'RM001', 'Rau muống tươi ngon, giòn ngọt', 'Đồng bằng sông Cửu Long', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (2, 1, 'Cà Chua Cherry', 'ca-chua-cherry', 'CC001', 'Cà chua cherry ngọt ngào, giàu vitamin', 'Lâm Đồng', 1, '2025-10-05 22:03:31', '2025-10-13 14:41:25');
INSERT INTO `products` VALUES (3, 1, 'Cà Rốt Baby', 'ca-rot-baby', 'CR001', 'Cà rốt baby ngọt ngào, giàu beta-carotene', 'Đà Lạt', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (4, 1, 'Bắp Cải Tím', 'bap-cai-tim', 'BC001', 'Bắp cải tím giòn ngọt, giàu chất chống oxy hóa', 'Mộc Châu', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (5, 1, 'Khoai Tây Tươi', 'khoai-tay-tuoi', 'KT001', 'Khoai tây tươi ngon, giàu tinh bột', 'Tây Nguyên', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (6, 2, 'Xoài Cát Hòa Lộc', 'xoai-cat-hoa-loc', 'XC001', 'Xoài cát Hòa Lộc ngọt ngào, thơm ngon', 'Tiền Giang', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (7, 2, 'Cam Sành', 'cam-sanh', 'CS001', 'Cam sành ngọt ngào, giàu vitamin C', 'Vĩnh Long', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (8, 2, 'Chuối Sứ', 'chuoi-su', 'CH001', 'Chuối sứ thơm ngon, giàu kali', 'Bến Tre', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (9, 2, 'Dưa Hấu Ruột Đỏ', 'dua-hau-ruot-do', 'DH001', 'Dưa hấu ruột đỏ ngọt mát', 'An Giang', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (10, 2, 'Ổi Nữ Hoàng', 'oi-nu-hoang', 'ON001', 'Ổi nữ hoàng giòn ngọt, giàu vitamin', 'Bình Dương', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (11, 3, 'Cà Phê Arabica', 'ca-phe-arabica', 'CP001', 'Cà phê Arabica thơm ngon, đậm đà', 'Buôn Ma Thuột', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (12, 3, 'Mật Ong Rừng', 'mat-ong-rung', 'MO001', 'Mật ong rừng nguyên chất, thơm ngon', 'Tây Nguyên', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (13, 3, 'Hạt Điều Rang Muối', 'hat-dieu-rang-muoi', 'HD001', 'Hạt điều rang muối giòn ngon', 'Bình Phước', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (14, 3, 'Trà Ô Long', 'tra-o-long', 'TO001', 'Trà Ô Long thơm ngon, thanh mát', 'Lâm Đồng', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (15, 3, 'Tiêu Đen', 'tieu-den', 'TD001', 'Tiêu đen thơm cay, chất lượng cao', 'Châu Đức', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (16, 4, 'Rau Xà Lách Hữu Cơ', 'rau-xa-lach-huu-co', 'RX001', 'Rau xà lách hữu cơ 100% tự nhiên', 'Đà Lạt', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (17, 4, 'Cà Chua Hữu Cơ', 'ca-chua-huu-co', 'CC002', 'Cà chua hữu cơ ngọt ngào, không hóa chất', 'Lâm Đồng', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (18, 4, 'Dưa Leo Hữu Cơ', 'dua-leo-huu-co', 'DL001', 'Dưa leo hữu cơ giòn ngọt', 'Đà Lạt', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (19, 4, 'Rau Thơm Hữu Cơ', 'rau-thom-huu-co', 'RT001', 'Rau thơm hữu cơ thơm ngon', 'Đà Lạt', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (20, 4, 'Cải Bó Xôi Hữu Cơ', 'cai-bo-xoi-huu-co', 'CB001', 'Cải bó xôi hữu cơ giàu sắt', 'Đà Lạt', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (21, 5, 'Hành Tây Tươi', 'hanh-tay-tuoi', 'HT001', 'Hành tây tươi thơm ngon', 'Đà Lạt', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (22, 5, 'Tỏi Tươi', 'toi-tuoi', 'TT001', 'Tỏi tươi thơm cay, chất lượng cao', 'Lý Sơn', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (23, 5, 'Gừng Tươi', 'gung-tuoi', 'GT001', 'Gừng tươi thơm cay, tốt cho sức khỏe', 'Quảng Nam', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (24, 5, 'Ớt Hiểm', 'ot-hiem', 'OH001', 'Ớt hiểm cay nồng, thơm ngon', 'Nghệ An', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');
INSERT INTO `products` VALUES (25, 5, 'Rau Ngò', 'rau-ngo', 'RN001', 'Rau ngò thơm ngon, tươi mát', 'Đà Lạt', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31');

-- ----------------------------
-- Table structure for reviews
-- ----------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NULL DEFAULT NULL,
  `rating` tinyint NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `images_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_reviews_product`(`product_id` ASC) USING BTREE,
  INDEX `idx_reviews_user`(`user_id` ASC) USING BTREE,
  INDEX `fk_reviews_order`(`order_id` ASC) USING BTREE,
  CONSTRAINT `fk_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of reviews
-- ----------------------------
INSERT INTO `reviews` VALUES (1, 1, 1, NULL, 5, 'Rau muống rất tươi ngon, giòn ngọt!', NULL, 1, '2025-10-05 22:03:31');
INSERT INTO `reviews` VALUES (2, 1, 2, NULL, 4, 'Cà chua cherry ngọt ngào, chất lượng tốt', NULL, 1, '2025-10-05 22:03:31');
INSERT INTO `reviews` VALUES (3, 1, 6, NULL, 5, 'Xoài cát Hòa Lộc thơm ngon, đúng chuẩn', NULL, 1, '2025-10-05 22:03:31');
INSERT INTO `reviews` VALUES (4, 1, 11, NULL, 5, 'Cà phê Arabica đậm đà, thơm ngon', NULL, 1, '2025-10-05 22:03:31');
INSERT INTO `reviews` VALUES (5, 1, 16, NULL, 4, 'Rau hữu cơ tươi ngon, an toàn', NULL, 1, '2025-10-05 22:03:31');

-- ----------------------------
-- Table structure for settings
-- ----------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings`  (
  `key` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of settings
-- ----------------------------
INSERT INTO `settings` VALUES ('contact_address', '123 Đường ABC, Quận XYZ, TP.HCM', '2025-10-05 22:03:31');
INSERT INTO `settings` VALUES ('contact_email', 'info@emonongsan.com', '2025-10-05 22:03:31');
INSERT INTO `settings` VALUES ('contact_phone', '0123 456 789', '2025-10-05 22:03:31');
INSERT INTO `settings` VALUES ('currency', 'VND', '2025-10-05 22:03:31');
INSERT INTO `settings` VALUES ('shipping_fee', '20000', '2025-10-05 22:03:31');
INSERT INTO `settings` VALUES ('site_description', 'Website bán nông sản địa phương tươi ngon', '2025-10-05 22:03:31');
INSERT INTO `settings` VALUES ('site_name', 'Emo Nông Sản', '2025-10-05 22:03:31');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `full_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `role` enum('customer','admin','seller') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'customer',
  `provider` enum('local','google') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'local',
  `provider_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `email_verified_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE,
  INDEX `idx_users_email`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin@emonongsan.com', '$2b$12$XhQ.Lg1fKbw7y2DbVJjjg.IRO233zNPqENkxRbl3gHt28CkohEzHW', 'Admin Emo Nông Sản', '0123456789', NULL, 'admin', 'local', NULL, NULL, '2025-10-05 22:03:31', '2025-10-13 20:33:00');
INSERT INTO `users` VALUES (2, 'customer@example.com', '$2b$12$XhQ.Lg1fKbw7y2DbVJjjg.IRO233zNPqENkxRbl3gHt28CkohEzHW', 'Khách Hàng Mẫu', '0987654321', NULL, 'customer', 'local', NULL, NULL, '2025-10-05 22:03:31', '2025-10-13 20:33:03');
INSERT INTO `users` VALUES (3, 'hotroando@gmail.com', '$2b$12$XhQ.Lg1fKbw7y2DbVJjjg.IRO233zNPqENkxRbl3gHt28CkohEzHW', 'Hỗ trợ đồ án', '0396693345', '/uploads/avatars/avatar_3_1759837640407.jpg', 'customer', 'local', NULL, NULL, '2025-10-07 08:45:51', '2025-10-07 11:47:20');

-- ----------------------------
-- Table structure for vnpay_transactions
-- ----------------------------
DROP TABLE IF EXISTS `vnpay_transactions`;
CREATE TABLE `vnpay_transactions`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `payment_id` bigint UNSIGNED NOT NULL,
  `vnp_TxnRef` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `vnp_TransactionNo` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `vnp_Amount` bigint NULL DEFAULT NULL,
  `vnp_BankCode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `vnp_ResponseCode` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `vnp_OrderInfo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `vnp_PayDate` varchar(14) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `vnp_SecureHash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `return_params_raw` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `ipn_params_raw` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_vnpay_payment`(`payment_id` ASC) USING BTREE,
  INDEX `idx_vnpay_txnref`(`vnp_TxnRef` ASC) USING BTREE,
  CONSTRAINT `fk_vnpay_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of vnpay_transactions
-- ----------------------------

-- ----------------------------
-- Table structure for wishlist_items
-- ----------------------------
DROP TABLE IF EXISTS `wishlist_items`;
CREATE TABLE `wishlist_items`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `wishlist_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `variant_id` bigint UNSIGNED NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_wishlist_item`(`wishlist_id` ASC, `product_id` ASC, `variant_id` ASC) USING BTREE,
  INDEX `fk_wishlist_items_product`(`product_id` ASC) USING BTREE,
  INDEX `fk_wishlist_items_variant`(`variant_id` ASC) USING BTREE,
  CONSTRAINT `fk_wishlist_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_wishlist_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_wishlist_items_wishlist` FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of wishlist_items
-- ----------------------------
INSERT INTO `wishlist_items` VALUES (2, 1, 1, NULL, '2025-10-07 14:41:13');
INSERT INTO `wishlist_items` VALUES (3, 1, 20, NULL, '2025-10-07 15:42:34');

-- ----------------------------
-- Table structure for wishlists
-- ----------------------------
DROP TABLE IF EXISTS `wishlists`;
CREATE TABLE `wishlists`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_wishlist_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_wishlists_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of wishlists
-- ----------------------------
INSERT INTO `wishlists` VALUES (1, 3, '2025-10-07 13:06:04');
INSERT INTO `wishlists` VALUES (2, 1, '2025-10-13 13:33:15');

SET FOREIGN_KEY_CHECKS = 1;
