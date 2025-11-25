/*
 Navicat Premium Dump SQL

 Source Server         : mysq8
 Source Server Type    : MySQL
 Source Server Version : 80403 (8.4.3)
 Source Host           : localhost:3318
 Source Schema         : emo_nongsan

 Target Server Type    : MySQL
 Target Server Version : 80403 (8.4.3)
 File Encoding         : 65001

 Date: 25/11/2025 22:07:35
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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_addresses_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of addresses
-- ----------------------------
INSERT INTO `addresses` VALUES (1, 3, 'dsd', '0386693354', 'Hà Nội', 'Hai bà trương', 'sá', 'sá', 1, '2025-10-07 10:33:56', '2025-10-07 10:33:56');
INSERT INTO `addresses` VALUES (2, 4, 'ducnt', '0386694454', 'Hà Tĩnh', 'Lộc hà', 'dsds', 'dsds', 1, '2025-11-13 07:30:35', '2025-11-13 07:30:35');

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
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_carts_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_carts_session`(`session_id` ASC) USING BTREE,
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of carts
-- ----------------------------
INSERT INTO `carts` VALUES (1, 3, NULL, '2025-10-07 08:50:39', '2025-10-07 08:50:39');
INSERT INTO `carts` VALUES (2, 1, NULL, '2025-10-13 13:33:15', '2025-10-13 13:33:15');
INSERT INTO `carts` VALUES (3, 4, NULL, '2025-11-13 07:29:26', '2025-11-13 07:29:26');

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
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_coupons_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of coupons
-- ----------------------------
INSERT INTO `coupons` VALUES (1, 'SALE', 'PERCENT', 10.00, 1000.00, NULL, 20, 0, '2025-11-12 00:00:00', '2025-11-28 00:00:00', 1, '2025-10-13 16:50:50', '2025-11-14 01:52:33');

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
) ENGINE = InnoDB AUTO_INCREMENT = 62 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of order_items
-- ----------------------------
INSERT INTO `order_items` VALUES (1, 1, 2, NULL, 'Cà Chua Cherry', 'Hộp 300g', 'CC001', 4, 25000.00, 100000.00);
INSERT INTO `order_items` VALUES (2, 1, 1, 1, 'Rau Muống Tươi', 'Gói 500g', 'RM001', 1, 15000.00, 15000.00);
INSERT INTO `order_items` VALUES (3, 2, 1, 1, 'Rau Muống Tươi', 'Gói 500g', 'RM001', 1, 15000.00, 15000.00);
INSERT INTO `order_items` VALUES (4, 3, 3, 3, 'Cà Rốt Baby', 'Túi 500g', 'CR001', 9, 20000.00, 180000.00);
INSERT INTO `order_items` VALUES (5, 4, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 1, 120000.00, 120000.00);
INSERT INTO `order_items` VALUES (6, 5, 1, 1, 'Rau Muống Tươi', 'Gói 500g', 'RM001', 17, 15000.00, 255000.00);
INSERT INTO `order_items` VALUES (7, 6, 1, 1, 'Rau Muống Tươi', 'Gói 500g', 'RM001', 17, 15000.00, 255000.00);
INSERT INTO `order_items` VALUES (8, 7, 1, 1, 'Rau Muống Tươi', 'Gói 500g', 'RM001', 17, 15000.00, 255000.00);
INSERT INTO `order_items` VALUES (9, 8, 1, 1, 'Rau Muống Tươi', 'Gói 500g', 'RM001', 17, 15000.00, 255000.00);
INSERT INTO `order_items` VALUES (10, 9, 1, 1, 'Rau Muống Tươi', 'Gói 500g', 'RM001', 17, 15000.00, 255000.00);
INSERT INTO `order_items` VALUES (11, 10, 1, 1, 'Rau Muống Tươi', 'Gói 500g', 'RM001', 17, 15000.00, 255000.00);
INSERT INTO `order_items` VALUES (12, 11, 1, 1, 'Rau Muống Tươi', 'Gói 500g', 'RM001', 17, 15000.00, 255000.00);
INSERT INTO `order_items` VALUES (13, 12, 1, 1, 'Rau Muống Tươi', 'Gói 500g', 'RM001', 17, 15000.00, 255000.00);
INSERT INTO `order_items` VALUES (14, 13, 1, 1, 'Rau Muống Tươi', 'Gói 500g', 'RM001', 17, 15000.00, 255000.00);
INSERT INTO `order_items` VALUES (15, 14, 1, 1, 'Rau Muống Tươi', 'Gói 500g', 'RM001', 17, 15000.00, 255000.00);
INSERT INTO `order_items` VALUES (16, 15, 1, 1, 'Rau Muống Tươi', 'Gói 500g', 'RM001', 17, 15000.00, 255000.00);
INSERT INTO `order_items` VALUES (17, 16, 1, 1, 'Rau Muống Tươi', 'Gói 500g', 'RM001', 17, 15000.00, 255000.00);
INSERT INTO `order_items` VALUES (18, 17, 5, 5, 'Khoai Tây Tươi', 'Túi 1kg', 'KT001', 9, 12000.00, 108000.00);
INSERT INTO `order_items` VALUES (19, 18, 5, 5, 'Khoai Tây Tươi', 'Túi 1kg', 'KT001', 9, 12000.00, 108000.00);
INSERT INTO `order_items` VALUES (20, 19, 5, 5, 'Khoai Tây Tươi', 'Túi 1kg', 'KT001', 9, 12000.00, 108000.00);
INSERT INTO `order_items` VALUES (21, 20, 9, 9, 'Dưa Hấu Ruột Đỏ', 'Quả 3kg', 'DH001', 1, 25000.00, 25000.00);
INSERT INTO `order_items` VALUES (22, 20, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 1, 120000.00, 120000.00);
INSERT INTO `order_items` VALUES (23, 21, 9, 9, 'Dưa Hấu Ruột Đỏ', 'Quả 3kg', 'DH001', 1, 25000.00, 25000.00);
INSERT INTO `order_items` VALUES (24, 21, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 1, 120000.00, 120000.00);
INSERT INTO `order_items` VALUES (25, 22, 9, 9, 'Dưa Hấu Ruột Đỏ', 'Quả 3kg', 'DH001', 1, 25000.00, 25000.00);
INSERT INTO `order_items` VALUES (26, 22, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 1, 120000.00, 120000.00);
INSERT INTO `order_items` VALUES (27, 23, 9, 9, 'Dưa Hấu Ruột Đỏ', 'Quả 3kg', 'DH001', 1, 25000.00, 25000.00);
INSERT INTO `order_items` VALUES (28, 23, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 1, 120000.00, 120000.00);
INSERT INTO `order_items` VALUES (29, 24, 9, 9, 'Dưa Hấu Ruột Đỏ', 'Quả 3kg', 'DH001', 1, 25000.00, 25000.00);
INSERT INTO `order_items` VALUES (30, 24, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 1, 120000.00, 120000.00);
INSERT INTO `order_items` VALUES (31, 25, 9, 9, 'Dưa Hấu Ruột Đỏ', 'Quả 3kg', 'DH001', 1, 25000.00, 25000.00);
INSERT INTO `order_items` VALUES (32, 25, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 1, 120000.00, 120000.00);
INSERT INTO `order_items` VALUES (33, 26, 9, 9, 'Dưa Hấu Ruột Đỏ', 'Quả 3kg', 'DH001', 1, 25000.00, 25000.00);
INSERT INTO `order_items` VALUES (34, 26, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 1, 120000.00, 120000.00);
INSERT INTO `order_items` VALUES (35, 27, 9, 9, 'Dưa Hấu Ruột Đỏ', 'Quả 3kg', 'DH001', 1, 25000.00, 25000.00);
INSERT INTO `order_items` VALUES (36, 27, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 1, 120000.00, 120000.00);
INSERT INTO `order_items` VALUES (37, 28, 9, 9, 'Dưa Hấu Ruột Đỏ', 'Quả 3kg', 'DH001', 1, 25000.00, 25000.00);
INSERT INTO `order_items` VALUES (38, 28, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 1, 120000.00, 120000.00);
INSERT INTO `order_items` VALUES (39, 29, 9, 9, 'Dưa Hấu Ruột Đỏ', 'Quả 3kg', 'DH001', 1, 25000.00, 25000.00);
INSERT INTO `order_items` VALUES (40, 29, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 1, 120000.00, 120000.00);
INSERT INTO `order_items` VALUES (41, 30, 9, 9, 'Dưa Hấu Ruột Đỏ', 'Quả 3kg', 'DH001', 1, 25000.00, 25000.00);
INSERT INTO `order_items` VALUES (42, 30, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 1, 120000.00, 120000.00);
INSERT INTO `order_items` VALUES (43, 31, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (44, 32, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (45, 33, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (46, 34, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (47, 35, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (48, 36, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (49, 37, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (50, 38, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (51, 39, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (52, 40, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (53, 41, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (54, 42, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (55, 43, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (56, 44, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (57, 45, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (58, 46, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (59, 47, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (60, 48, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 2, 120000.00, 240000.00);
INSERT INTO `order_items` VALUES (61, 49, 12, 12, 'Mật Ong Rừng', 'Chai 500ml', 'MO001', 3, 120000.00, 360000.00);

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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `coupon_id` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_orders_code`(`order_code` ASC) USING BTREE,
  INDEX `idx_orders_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 50 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO `orders` VALUES (1, 'ORD-1759833395222-32d67c03l', 3, 'PENDING', 'UNPAID', 'COD', 0.00, 0.00, 0.00, 115000.00, NULL, '', '2025-10-07 10:36:35', '2025-10-07 10:36:35', NULL);
INSERT INTO `orders` VALUES (2, 'ORD-1759850045315-2ncbgrry3', 3, 'PENDING', 'REFUNDED', 'COD', 0.00, 0.00, 0.00, 15000.00, NULL, '', '2025-10-07 15:14:05', '2025-10-13 17:30:13', NULL);
INSERT INTO `orders` VALUES (3, 'ORD-1759850170865-guw0s5m66', 3, 'PENDING', 'FAILED', 'COD', 0.00, 0.00, 0.00, 180000.00, NULL, 'dadadada', '2025-10-07 15:16:10', '2025-10-13 17:30:08', NULL);
INSERT INTO `orders` VALUES (4, 'ORD-1759851767311-eszxuud9i', 3, 'SHIPPING', 'PAID', 'COD', 0.00, 0.00, 0.00, 120000.00, NULL, 'sâsa', '2025-10-07 15:42:47', '2025-10-13 17:29:58', NULL);
INSERT INTO `orders` VALUES (5, 'ORD-1763019166943-koam33of6', 4, 'PENDING', 'UNPAID', 'VNPAY', 255000.00, 0.00, 20000.00, 275000.00, NULL, '', '2025-11-13 07:32:47', '2025-11-13 07:32:47', NULL);
INSERT INTO `orders` VALUES (6, 'ORD-1763019171747-psyjz8zju', 4, 'PENDING', 'UNPAID', 'VNPAY', 255000.00, 0.00, 20000.00, 275000.00, NULL, '', '2025-11-13 07:32:52', '2025-11-13 07:32:52', NULL);
INSERT INTO `orders` VALUES (7, 'ORD-1763019265920-hxbace437', 4, 'PENDING', 'UNPAID', 'VNPAY', 255000.00, 0.00, 20000.00, 275000.00, NULL, '', '2025-11-13 07:34:26', '2025-11-13 07:34:26', NULL);
INSERT INTO `orders` VALUES (8, 'ORD-1763019266712-t632cf7fn', 4, 'PENDING', 'UNPAID', 'VNPAY', 255000.00, 0.00, 20000.00, 275000.00, NULL, '', '2025-11-13 07:34:27', '2025-11-13 07:34:27', NULL);
INSERT INTO `orders` VALUES (9, 'ORD-1763019266962-uw39gid0l', 4, 'PENDING', 'UNPAID', 'VNPAY', 255000.00, 0.00, 20000.00, 275000.00, NULL, '', '2025-11-13 07:34:27', '2025-11-13 07:34:27', NULL);
INSERT INTO `orders` VALUES (10, 'ORD-1763019267112-tpv9m2may', 4, 'PENDING', 'UNPAID', 'VNPAY', 255000.00, 0.00, 20000.00, 275000.00, NULL, '', '2025-11-13 07:34:27', '2025-11-13 07:34:27', NULL);
INSERT INTO `orders` VALUES (11, 'ORD-1763019267296-7ainz64bj', 4, 'PENDING', 'UNPAID', 'VNPAY', 255000.00, 0.00, 20000.00, 275000.00, NULL, '', '2025-11-13 07:34:27', '2025-11-13 07:34:27', NULL);
INSERT INTO `orders` VALUES (12, 'ORD-1763019355589-h3eivef0g', 4, 'PENDING', 'UNPAID', 'VNPAY', 255000.00, 0.00, 20000.00, 275000.00, NULL, '', '2025-11-13 07:35:56', '2025-11-13 07:35:56', NULL);
INSERT INTO `orders` VALUES (13, 'ORD-1763019405616-p5zq1uhx2', 4, 'PENDING', 'UNPAID', 'VNPAY', 255000.00, 0.00, 20000.00, 275000.00, NULL, '', '2025-11-13 07:36:46', '2025-11-13 07:36:46', NULL);
INSERT INTO `orders` VALUES (14, 'ORD-1763019572198-yh66dzxvp', 4, 'PENDING', 'UNPAID', 'VNPAY', 255000.00, 0.00, 20000.00, 275000.00, NULL, '', '2025-11-13 07:39:32', '2025-11-13 07:39:32', NULL);
INSERT INTO `orders` VALUES (15, 'ORD-1763019827403-zaj51tg6d', 4, 'PENDING', 'UNPAID', 'VNPAY', 255000.00, 0.00, 20000.00, 275000.00, NULL, '', '2025-11-13 07:43:47', '2025-11-13 07:43:47', NULL);
INSERT INTO `orders` VALUES (16, 'ORD-1763019990640-ob2764fzi', 4, 'SHIPPING', 'PAID', 'COD', 255000.00, 0.00, 20000.00, 275000.00, NULL, '', '2025-11-13 07:46:31', '2025-11-13 07:48:43', NULL);
INSERT INTO `orders` VALUES (17, 'ORD-1763020368930-ciuu96bqr', 4, 'PENDING', 'UNPAID', 'VNPAY', 108000.00, 0.00, 20000.00, 128000.00, NULL, '', '2025-11-13 07:52:49', '2025-11-13 07:52:49', NULL);
INSERT INTO `orders` VALUES (18, 'ORD-1763020562971-pht4mz1xs', 4, 'PENDING', 'UNPAID', 'VNPAY', 108000.00, 0.00, 20000.00, 128000.00, NULL, '', '2025-11-13 07:56:03', '2025-11-13 07:56:03', NULL);
INSERT INTO `orders` VALUES (19, 'ORD-1763020620456-6syuduejg', 4, 'PENDING', 'UNPAID', 'COD', 108000.00, 0.00, 20000.00, 128000.00, NULL, '', '2025-11-13 07:57:00', '2025-11-13 07:57:00', NULL);
INSERT INTO `orders` VALUES (20, 'ORD-1763020641857-0bjlmxk79', 4, 'PENDING', 'UNPAID', 'VNPAY', 145000.00, 0.00, 20000.00, 165000.00, NULL, '', '2025-11-13 07:57:22', '2025-11-13 07:57:22', NULL);
INSERT INTO `orders` VALUES (21, 'ORD-1763021097981-b5bq4s9yh', 4, 'PENDING', 'UNPAID', 'VNPAY', 145000.00, 0.00, 20000.00, 165000.00, NULL, '', '2025-11-13 08:04:58', '2025-11-13 08:04:58', NULL);
INSERT INTO `orders` VALUES (22, 'ORD-1763021161728-vbmec11od', 4, 'PENDING', 'UNPAID', 'VNPAY', 145000.00, 0.00, 20000.00, 165000.00, NULL, '', '2025-11-13 08:06:02', '2025-11-13 08:06:02', NULL);
INSERT INTO `orders` VALUES (23, 'ORD-1763021398619-apayfsfnz', 4, 'PENDING', 'UNPAID', 'VNPAY', 145000.00, 0.00, 20000.00, 165000.00, NULL, '', '2025-11-13 08:09:59', '2025-11-13 08:09:59', NULL);
INSERT INTO `orders` VALUES (24, 'ORD-1763021713204-de97oy4qr', 4, 'PENDING', 'UNPAID', 'VNPAY', 145000.00, 0.00, 20000.00, 165000.00, NULL, '', '2025-11-13 08:15:13', '2025-11-13 08:15:13', NULL);
INSERT INTO `orders` VALUES (25, 'ORD-1763021978497-mpec89ml9', 4, 'PENDING', 'UNPAID', 'VNPAY', 145000.00, 0.00, 20000.00, 165000.00, NULL, '', '2025-11-13 08:19:38', '2025-11-13 08:19:38', NULL);
INSERT INTO `orders` VALUES (26, 'ORD-1763022036822-wofql973r', 4, 'PENDING', 'UNPAID', 'VNPAY', 145000.00, 0.00, 20000.00, 165000.00, NULL, '', '2025-11-13 08:20:37', '2025-11-13 08:20:37', NULL);
INSERT INTO `orders` VALUES (27, 'ORD-1763022129971-09zjeu7sd', 4, 'PENDING', 'UNPAID', 'VNPAY', 145000.00, 0.00, 20000.00, 165000.00, NULL, '', '2025-11-13 08:22:10', '2025-11-13 08:22:10', NULL);
INSERT INTO `orders` VALUES (28, 'ORD-1763022278215-ornoo98cp', 4, 'PENDING', 'UNPAID', 'VNPAY', 145000.00, 0.00, 20000.00, 165000.00, NULL, '', '2025-11-13 08:24:38', '2025-11-13 08:24:38', NULL);
INSERT INTO `orders` VALUES (29, 'ORD-1763022443847-khihn6ljs', 4, 'PENDING', 'UNPAID', 'VNPAY', 145000.00, 0.00, 20000.00, 165000.00, NULL, '', '2025-11-13 08:27:24', '2025-11-13 08:27:24', NULL);
INSERT INTO `orders` VALUES (30, 'ORD-1763022805767-8ffyzeac6', 4, 'PENDING', 'UNPAID', 'COD', 145000.00, 0.00, 20000.00, 165000.00, NULL, '', '2025-11-13 08:33:26', '2025-11-13 08:33:26', NULL);
INSERT INTO `orders` VALUES (31, 'ORD-1763022832955-i0kgsrm34', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-13 08:33:53', '2025-11-13 08:33:53', NULL);
INSERT INTO `orders` VALUES (32, 'ORD-1763023429554-3eua0e1cb', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-13 08:43:50', '2025-11-13 08:43:50', NULL);
INSERT INTO `orders` VALUES (33, 'ORD-1763023631377-0omejncrz', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-13 08:47:11', '2025-11-13 08:47:11', NULL);
INSERT INTO `orders` VALUES (34, 'ORD-1763023723792-og7tgk4aj', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-13 08:48:44', '2025-11-13 08:48:44', NULL);
INSERT INTO `orders` VALUES (35, 'ORD-1763023901942-39h24dlye', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-13 08:51:42', '2025-11-13 08:51:42', NULL);
INSERT INTO `orders` VALUES (36, 'ORD-1763024979120-4va9wara5', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-13 09:09:39', '2025-11-13 09:09:39', NULL);
INSERT INTO `orders` VALUES (37, 'ORD-1763025317476-is0pxgoh4', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-13 09:15:17', '2025-11-13 09:15:17', NULL);
INSERT INTO `orders` VALUES (38, 'ORD-1763025642867-px1tot9vy', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-13 09:20:43', '2025-11-13 09:20:43', NULL);
INSERT INTO `orders` VALUES (39, 'ORD-1763025797775-j8isipvr6', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-13 09:23:18', '2025-11-13 09:23:18', NULL);
INSERT INTO `orders` VALUES (40, 'ORD-1763026022031-9t4ygyrez', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-13 09:27:02', '2025-11-13 09:27:02', NULL);
INSERT INTO `orders` VALUES (41, 'ORD-1763026250530-c9xug3jmp', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-13 09:30:51', '2025-11-13 09:30:51', NULL);
INSERT INTO `orders` VALUES (42, 'ORD-1763026993058-4pk9b2fw4', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-13 09:43:13', '2025-11-13 09:43:13', NULL);
INSERT INTO `orders` VALUES (43, 'ORD-1763027423560-ogy89o5fj', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-13 09:50:24', '2025-11-13 09:50:24', NULL);
INSERT INTO `orders` VALUES (44, 'ORD-1763027692346-qep8qnnhq', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-13 09:54:52', '2025-11-13 09:54:52', NULL);
INSERT INTO `orders` VALUES (45, 'ORD-1763027883424-i67yg96zr', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-13 09:58:03', '2025-11-13 09:58:03', NULL);
INSERT INTO `orders` VALUES (46, 'ORD-1763027938448-98801nnok', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-13 09:58:58', '2025-11-13 09:58:58', NULL);
INSERT INTO `orders` VALUES (47, 'ORD-1763028270383-12mqh06xw', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-13 10:04:30', '2025-11-13 10:04:30', NULL);
INSERT INTO `orders` VALUES (48, 'ORD-1763084521668-rw7tugoy2', 4, 'PENDING', 'UNPAID', 'VNPAY', 240000.00, 0.00, 20000.00, 260000.00, NULL, '', '2025-11-14 01:42:02', '2025-11-14 01:42:02', NULL);
INSERT INTO `orders` VALUES (49, 'ORD-1763084582097-3f3gq34yt', 4, 'CONFIRMED', 'PAID', 'VNPAY', 360000.00, 0.00, 20000.00, 380000.00, NULL, '', '2025-11-14 01:43:02', '2025-11-14 01:43:48', NULL);

-- ----------------------------
-- Table structure for password_reset_tokens
-- ----------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_reset_token`(`token` ASC) USING BTREE,
  INDEX `fk_reset_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of password_reset_tokens
-- ----------------------------
INSERT INTO `password_reset_tokens` VALUES (1, 1, 'b59485741e7bb8a019154d525d3c9fca40402d656482442965b16257a1370ecf', '2025-11-13 07:43:40', '2025-11-13 07:28:40');

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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_payments_order`(`order_id` ASC) USING BTREE,
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 28 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 29 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of product_variants
-- ----------------------------
INSERT INTO `product_variants` VALUES (1, 1, 'Gói 500g', 'gói', 15000.00, 20000.00, 81, 1);
INSERT INTO `product_variants` VALUES (3, 3, 'Túi 500g', 'túi', 20000.00, 25000.00, 81, 1);
INSERT INTO `product_variants` VALUES (4, 4, 'Cái 1kg', 'cái', 18000.00, 22000.00, 70, 1);
INSERT INTO `product_variants` VALUES (5, 5, 'Túi 1kg', 'túi', 12000.00, 15000.00, 111, 1);
INSERT INTO `product_variants` VALUES (6, 6, 'Túi 1kg', 'túi', 35000.00, 40000.00, 60, 1);
INSERT INTO `product_variants` VALUES (7, 7, 'Túi 1kg', 'túi', 30000.00, 35000.00, 75, 1);
INSERT INTO `product_variants` VALUES (8, 8, 'Nải 1kg', 'nải', 15000.00, 18000.00, 100, 1);
INSERT INTO `product_variants` VALUES (9, 9, 'Quả 3kg', 'quả', 25000.00, 30000.00, 49, 1);
INSERT INTO `product_variants` VALUES (10, 10, 'Túi 1kg', 'túi', 20000.00, 25000.00, 85, 1);
INSERT INTO `product_variants` VALUES (11, 11, 'Gói 250g', 'gói', 80000.00, 100000.00, 40, 1);
INSERT INTO `product_variants` VALUES (12, 12, 'Chai 500ml', 'chai', 120000.00, 150000.00, 25, 1);
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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `seller_id` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_products_slug`(`slug` ASC) USING BTREE,
  INDEX `idx_products_category`(`category_id` ASC) USING BTREE,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 26 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES (1, 1, 'Rau Muống Tươi', 'rau-muong-tuoi', 'RM001', 'Rau muống tươi ngon, giòn ngọt', 'Đồng bằng sông Cửu Long', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (2, 1, 'Cà Chua Cherry', 'ca-chua-cherry', 'CC001', 'Cà chua cherry ngọt ngào, giàu vitamin', 'Lâm Đồng', 1, '2025-10-05 22:03:31', '2025-10-13 14:41:25', NULL);
INSERT INTO `products` VALUES (3, 1, 'Cà Rốt Baby', 'ca-rot-baby', 'CR001', 'Cà rốt baby ngọt ngào, giàu beta-carotene', 'Đà Lạt', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (4, 1, 'Bắp Cải Tím', 'bap-cai-tim', 'BC001', 'Bắp cải tím giòn ngọt, giàu chất chống oxy hóa', 'Mộc Châu', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (5, 1, 'Khoai Tây Tươi', 'khoai-tay-tuoi', 'KT001', 'Khoai tây tươi ngon, giàu tinh bột', 'Tây Nguyên', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (6, 2, 'Xoài Cát Hòa Lộc', 'xoai-cat-hoa-loc', 'XC001', 'Xoài cát Hòa Lộc ngọt ngào, thơm ngon', 'Tiền Giang', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (7, 2, 'Cam Sành', 'cam-sanh', 'CS001', 'Cam sành ngọt ngào, giàu vitamin C', 'Vĩnh Long', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (8, 2, 'Chuối Sứ', 'chuoi-su', 'CH001', 'Chuối sứ thơm ngon, giàu kali', 'Bến Tre', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (9, 2, 'Dưa Hấu Ruột Đỏ', 'dua-hau-ruot-do', 'DH001', 'Dưa hấu ruột đỏ ngọt mát', 'An Giang', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (10, 2, 'Ổi Nữ Hoàng', 'oi-nu-hoang', 'ON001', 'Ổi nữ hoàng giòn ngọt, giàu vitamin', 'Bình Dương', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (11, 3, 'Cà Phê Arabica', 'ca-phe-arabica', 'CP001', 'Cà phê Arabica thơm ngon, đậm đà', 'Buôn Ma Thuột', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (12, 3, 'Mật Ong Rừng', 'mat-ong-rung', 'MO001', 'Mật ong rừng nguyên chất, thơm ngon', 'Tây Nguyên', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (13, 3, 'Hạt Điều Rang Muối', 'hat-dieu-rang-muoi', 'HD001', 'Hạt điều rang muối giòn ngon', 'Bình Phước', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (14, 3, 'Trà Ô Long', 'tra-o-long', 'TO001', 'Trà Ô Long thơm ngon, thanh mát', 'Lâm Đồng', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (15, 3, 'Tiêu Đen', 'tieu-den', 'TD001', 'Tiêu đen thơm cay, chất lượng cao', 'Châu Đức', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (16, 4, 'Rau Xà Lách Hữu Cơ', 'rau-xa-lach-huu-co', 'RX001', 'Rau xà lách hữu cơ 100% tự nhiên', 'Đà Lạt', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (17, 4, 'Cà Chua Hữu Cơ', 'ca-chua-huu-co', 'CC002', 'Cà chua hữu cơ ngọt ngào, không hóa chất', 'Lâm Đồng', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (18, 4, 'Dưa Leo Hữu Cơ', 'dua-leo-huu-co', 'DL001', 'Dưa leo hữu cơ giòn ngọt', 'Đà Lạt', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (19, 4, 'Rau Thơm Hữu Cơ', 'rau-thom-huu-co', 'RT001', 'Rau thơm hữu cơ thơm ngon', 'Đà Lạt', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (20, 4, 'Cải Bó Xôi Hữu Cơ', 'cai-bo-xoi-huu-co', 'CB001', 'Cải bó xôi hữu cơ giàu sắt', 'Đà Lạt', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (21, 5, 'Hành Tây Tươi', 'hanh-tay-tuoi', 'HT001', 'Hành tây tươi thơm ngon', 'Đà Lạt', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (22, 5, 'Tỏi Tươi', 'toi-tuoi', 'TT001', 'Tỏi tươi thơm cay, chất lượng cao', 'Lý Sơn', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (23, 5, 'Gừng Tươi', 'gung-tuoi', 'GT001', 'Gừng tươi thơm cay, tốt cho sức khỏe', 'Quảng Nam', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (24, 5, 'Ớt Hiểm', 'ot-hiem', 'OH001', 'Ớt hiểm cay nồng, thơm ngon', 'Nghệ An', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);
INSERT INTO `products` VALUES (25, 5, 'Rau Ngò', 'rau-ngo', 'RN001', 'Rau ngò thơm ngon, tươi mát', 'Đà Lạt', 1, '2025-10-05 22:03:31', '2025-10-05 22:03:31', NULL);

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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_reviews_product`(`product_id` ASC) USING BTREE,
  INDEX `idx_reviews_user`(`user_id` ASC) USING BTREE,
  INDEX `fk_reviews_order`(`order_id` ASC) USING BTREE,
  CONSTRAINT `fk_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

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
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE,
  INDEX `idx_users_email`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin@emonongsan.com', '$2b$12$XhQ.Lg1fKbw7y2DbVJjjg.IRO233zNPqENkxRbl3gHt28CkohEzHW', 'Admin Emo Nông Sản', '0123456789', NULL, 'admin', 'local', NULL, NULL, '2025-10-05 22:03:31', '2025-11-13 14:29:35');
INSERT INTO `users` VALUES (2, 'customer@example.com', '$2b$12$XhQ.Lg1fKbw7y2DbVJjjg.IRO233zNPqENkxRbl3gHt28CkohEzHW', 'Khách Hàng Mẫu', '0987654321', NULL, 'customer', 'local', NULL, NULL, '2025-10-05 22:03:31', '2025-11-13 14:39:25');
INSERT INTO `users` VALUES (3, 'hotroando@gmail.com', '$2b$12$XhQ.Lg1fKbw7y2DbVJjjg.IRO233zNPqENkxRbl3gHt28CkohEzHW', 'Hỗ trợ đồ án', '0396693345', '/uploads/avatars/avatar_3_1759837640407.jpg', 'customer', 'local', NULL, NULL, '2025-10-07 08:45:51', '2025-11-13 14:39:25');
INSERT INTO `users` VALUES (4, 'ducnt@gmail.com', '$2b$12$XhQ.Lg1fKbw7y2DbVJjjg.IRO233zNPqENkxRbl3gHt28CkohEzHW', 'ducnt', '0386693354', NULL, 'seller', 'local', NULL, NULL, '2025-11-13 07:29:25', '2025-11-18 09:32:46');
INSERT INTO `users` VALUES (5, 'trongduc02@gmail.com', NULL, 'Nguyễn Trọng Đức', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJ-yn99Bhzilh4e51bhaGbuhdCnoC-HnfxveYEpwJOc1xoKXWMz=s96-c', 'customer', 'google', '105585875776099629357', NULL, '2025-11-21 04:17:28', '2025-11-21 04:17:28');

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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_vnpay_payment`(`payment_id` ASC) USING BTREE,
  INDEX `idx_vnpay_txnref`(`vnp_TxnRef` ASC) USING BTREE,
  CONSTRAINT `fk_vnpay_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_wishlist_item`(`wishlist_id` ASC, `product_id` ASC, `variant_id` ASC) USING BTREE,
  INDEX `fk_wishlist_items_product`(`product_id` ASC) USING BTREE,
  INDEX `fk_wishlist_items_variant`(`variant_id` ASC) USING BTREE,
  CONSTRAINT `fk_wishlist_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_wishlist_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_wishlist_items_wishlist` FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_wishlist_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_wishlists_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of wishlists
-- ----------------------------
INSERT INTO `wishlists` VALUES (1, 3, '2025-10-07 13:06:04');
INSERT INTO `wishlists` VALUES (2, 1, '2025-10-13 13:33:15');
INSERT INTO `wishlists` VALUES (3, 4, '2025-11-13 07:29:26');

SET FOREIGN_KEY_CHECKS = 1;
