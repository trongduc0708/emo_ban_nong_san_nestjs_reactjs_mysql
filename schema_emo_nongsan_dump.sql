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

 Date: 24/09/2025 18:47:56
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for addresses
-- ----------------------------
DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `phone` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `province` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `district` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ward` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `addressLine` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `isDefault` tinyint(1) NOT NULL DEFAULT 0,
  `recipientName` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  `userId` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `addresses_userId_idx`(`userId` ASC) USING BTREE,
  CONSTRAINT `addresses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of addresses
-- ----------------------------

-- ----------------------------
-- Table structure for cart_items
-- ----------------------------
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `cartId` bigint NOT NULL,
  `productId` bigint NOT NULL,
  `unitPriceSnapshot` decimal(12, 2) NOT NULL,
  `variantId` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `cart_items_cartId_idx`(`cartId` ASC) USING BTREE,
  INDEX `cart_items_productId_fkey`(`productId` ASC) USING BTREE,
  INDEX `cart_items_variantId_fkey`(`variantId` ASC) USING BTREE,
  CONSTRAINT `cart_items_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `cart_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cart_items
-- ----------------------------
INSERT INTO `cart_items` VALUES (1, 2, 1, 1, 25000.00, 1);
INSERT INTO `cart_items` VALUES (2, 1, 1, 3, 55000.00, 4);

-- ----------------------------
-- Table structure for carts
-- ----------------------------
DROP TABLE IF EXISTS `carts`;
CREATE TABLE `carts`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `sessionId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL,
  `userId` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `carts_userId_key`(`userId` ASC) USING BTREE,
  INDEX `carts_userId_idx`(`userId` ASC) USING BTREE,
  INDEX `carts_sessionId_idx`(`sessionId` ASC) USING BTREE,
  CONSTRAINT `carts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of carts
-- ----------------------------
INSERT INTO `carts` VALUES (1, '2025-09-24 18:17:36.000', NULL, '2025-09-24 18:17:36.000', 1);

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `position` int NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `parentId` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `categories_slug_key`(`slug` ASC) USING BTREE,
  INDEX `categories_parentId_idx`(`parentId` ASC) USING BTREE,
  CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES (1, 'Rau củ', 'rau-cu', 'Các loại rau củ tươi', 1, 1, NULL);
INSERT INTO `categories` VALUES (2, 'Trái cây', 'trai-cay', 'Các loại trái cây', 2, 1, NULL);
INSERT INTO `categories` VALUES (3, 'Rau lá', 'rau-la', 'Nhóm rau lá', 1, 1, 1);

-- ----------------------------
-- Table structure for coupons
-- ----------------------------
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `type` enum('PERCENT','FIXED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `value` decimal(12, 2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `endsAt` datetime(3) NULL DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `maxDiscountAmount` decimal(12, 2) NULL DEFAULT NULL,
  `minOrderAmount` decimal(12, 2) NULL DEFAULT NULL,
  `startsAt` datetime(3) NULL DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL,
  `usageLimit` int NULL DEFAULT NULL,
  `usedCount` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `coupons_code_key`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of coupons
-- ----------------------------
INSERT INTO `coupons` VALUES (1, 'SALE10', 'PERCENT', 10.00, '2025-09-24 18:20:25.000', '2025-10-24 18:20:25.000', 1, 50000.00, 100000.00, '2025-09-24 18:20:25.000', '2025-09-24 18:20:25.000', 100, 0);

-- ----------------------------
-- Table structure for order_items
-- ----------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sku` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `quantity` int NOT NULL,
  `orderId` bigint NOT NULL,
  `productId` bigint NOT NULL,
  `productName` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `totalPrice` decimal(12, 2) NOT NULL,
  `unitPrice` decimal(12, 2) NOT NULL,
  `variantId` bigint NULL DEFAULT NULL,
  `variantName` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `order_items_orderId_idx`(`orderId` ASC) USING BTREE,
  INDEX `order_items_productId_fkey`(`productId` ASC) USING BTREE,
  INDEX `order_items_variantId_fkey`(`variantId` ASC) USING BTREE,
  CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `order_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_items
-- ----------------------------
INSERT INTO `order_items` VALUES (1, 'SP-CT-HC-500', 1, 1, 1, 'Cà chua hữu cơ', 45000.00, 45000.00, 2, '1kg');
INSERT INTO `order_items` VALUES (2, 'SP-TD-T-200', 1, 1, 3, 'Táo đỏ tươi', 55000.00, 55000.00, 4, '1kg');

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `status` enum('PENDING','CONFIRMED','PREPARING','SHIPPING','COMPLETED','CANCELLED','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'PENDING',
  `notes` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `discountAmount` decimal(12, 2) NOT NULL DEFAULT 0.00,
  `orderCode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `paymentMethod` enum('COD','VNPAY') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'VNPAY',
  `paymentStatus` enum('UNPAID','PAID','FAILED','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'UNPAID',
  `shippingAddressSnapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `shippingFee` decimal(12, 2) NOT NULL DEFAULT 0.00,
  `subtotalAmount` decimal(12, 2) NOT NULL DEFAULT 0.00,
  `totalAmount` decimal(12, 2) NOT NULL DEFAULT 0.00,
  `updatedAt` datetime(3) NOT NULL,
  `userId` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `orders_orderCode_key`(`orderCode` ASC) USING BTREE,
  INDEX `orders_userId_idx`(`userId` ASC) USING BTREE,
  CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO `orders` VALUES (1, 'COMPLETED', 'Demo đơn hàng', '2025-09-24 18:23:15.000', 10000.00, 'EMO0001', 'VNPAY', 'PAID', '{\"recipientname\": \"Demo\", \"phone\": \"0900000000\", \"province\": \"TP.HCM\", \"district\": \"Quận 1\", \"ward\": \"Bến Nghé\", \"addressline\": \"12 Lê Lợi\"}', 20000.00, 105000.00, 115000.00, '2025-09-24 18:23:15.000', 1);

-- ----------------------------
-- Table structure for password_reset_tokens
-- ----------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `expiresAt` datetime(3) NOT NULL,
  `userId` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `password_reset_tokens_token_key`(`token` ASC) USING BTREE,
  INDEX `password_reset_tokens_userId_fkey`(`userId` ASC) USING BTREE,
  CONSTRAINT `password_reset_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of password_reset_tokens
-- ----------------------------

-- ----------------------------
-- Table structure for payments
-- ----------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `provider` enum('VNPAY','COD') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'VNPAY',
  `amount` decimal(12, 2) NOT NULL,
  `currency` char(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'VND',
  `status` enum('PENDING','SUCCESS','FAILED','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `orderId` bigint NOT NULL,
  `paidAt` datetime(3) NULL DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `payments_orderId_key`(`orderId` ASC) USING BTREE,
  CONSTRAINT `payments_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of payments
-- ----------------------------
INSERT INTO `payments` VALUES (1, 'VNPAY', 115000.00, 'VND', 'SUCCESS', '2025-09-24 18:23:38.000', 1, '2025-09-24 18:23:38.000', '2025-09-24 18:23:38.000');

-- ----------------------------
-- Table structure for product_images
-- ----------------------------
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `position` int NOT NULL DEFAULT 0,
  `imageUrl` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `productId` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `product_images_productId_idx`(`productId` ASC) USING BTREE,
  CONSTRAINT `product_images_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_images
-- ----------------------------
INSERT INTO `product_images` VALUES (1, 1, 'https://picsum.photos/id/101/800/600', 1);
INSERT INTO `product_images` VALUES (2, 2, 'https://picsum.photos/id/102/800/600', 1);
INSERT INTO `product_images` VALUES (3, 1, 'https://picsum.photos/id/103/800/600', 2);
INSERT INTO `product_images` VALUES (4, 1, 'https://picsum.photos/id/104/800/600', 3);

-- ----------------------------
-- Table structure for product_variants
-- ----------------------------
DROP TABLE IF EXISTS `product_variants`;
CREATE TABLE `product_variants`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `price` decimal(12, 2) NOT NULL,
  `compareAtPrice` decimal(12, 2) NULL DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `productId` bigint NOT NULL,
  `stockQuantity` int NOT NULL DEFAULT 0,
  `unitLabel` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `variantName` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `product_variants_productId_idx`(`productId` ASC) USING BTREE,
  CONSTRAINT `product_variants_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_variants
-- ----------------------------
INSERT INTO `product_variants` VALUES (1, 25000.00, NULL, 1, 1, 100, 'Gói', '500g');
INSERT INTO `product_variants` VALUES (2, 45000.00, 50000.00, 1, 1, 80, 'Gói', '1kg');
INSERT INTO `product_variants` VALUES (3, 15000.00, NULL, 1, 2, 200, 'Bó', '300g');
INSERT INTO `product_variants` VALUES (4, 55000.00, 60000.00, 1, 3, 150, 'Túi', '1kg');

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sku` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `origin` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `categoryId` bigint NULL DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `products_slug_key`(`slug` ASC) USING BTREE,
  INDEX `products_categoryId_idx`(`categoryId` ASC) USING BTREE,
  CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES (1, 'Cà chua hữu cơ', 'ca-chua-huu-co', 'SP-CT-HC-500', 'Cà chua hữu cơ, tươi ngon', 'Đà Lạt', 1, '2025-09-24 18:12:44.000', 1, '2025-09-24 18:12:44.000');
INSERT INTO `products` VALUES (2, 'Rau muống sạch', 'rau-muong-sach', 'SP-RM-S-300', 'Rau muống tươi, sạch', 'Long An', 3, '2025-09-24 18:12:44.000', 1, '2025-09-24 18:12:44.000');
INSERT INTO `products` VALUES (3, 'Táo đỏ tươi', 'tao-do-tuoi', 'SP-TD-T-200', 'Táo đỏ giòn ngọt', 'Mỹ', 2, '2025-09-24 18:12:44.000', 1, '2025-09-24 18:12:44.000');

-- ----------------------------
-- Table structure for reviews
-- ----------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rating` tinyint NOT NULL,
  `comment` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `imagesJson` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `isApproved` tinyint(1) NOT NULL DEFAULT 0,
  `orderId` bigint NULL DEFAULT NULL,
  `productId` bigint NOT NULL,
  `userId` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `reviews_productId_idx`(`productId` ASC) USING BTREE,
  INDEX `reviews_userId_idx`(`userId` ASC) USING BTREE,
  INDEX `reviews_orderId_fkey`(`orderId` ASC) USING BTREE,
  CONSTRAINT `reviews_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `reviews_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reviews_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of reviews
-- ----------------------------
INSERT INTO `reviews` VALUES (1, 5, 'Rất tươi và ngon!', '2025-09-24 18:25:00.000', NULL, 1, 1, 1, 1);

-- ----------------------------
-- Table structure for settings
-- ----------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings`  (
  `key` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `value` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`key`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of settings
-- ----------------------------
INSERT INTO `settings` VALUES ('currency', 'VND', '2025-09-24 18:25:00.000');
INSERT INTO `settings` VALUES ('shippingfeedefault', '20000', '2025-09-24 18:25:00.000');
INSERT INTO `settings` VALUES ('vnphashsecret', 'DEMOHASHSECRET', '2025-09-24 18:25:00.000');
INSERT INTO `settings` VALUES ('vnptmncode', 'DEMOTMNCODE', '2025-09-24 18:25:00.000');
INSERT INTO `settings` VALUES ('vnpurl', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', '2025-09-24 18:25:00.000');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `role` enum('customer','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'customer',
  `provider` enum('local','google') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'local',
  `avatarUrl` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `emailVerifiedAt` datetime(3) NULL DEFAULT NULL,
  `fullName` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `passwordHash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `providerId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `users_email_key`(`email` ASC) USING BTREE,
  INDEX `users_email_idx`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'trongduc03@gmail.com', '0386693354', 'customer', 'local', NULL, '2025-09-24 09:48:00.836', NULL, 'Nguyễn Trọng Đức', '$2b$12$dMsAe34aAL5VANkU9In4Ze9VKC7ZRf/h7z.McXXpYUKo8DZGGwS8.', NULL, '2025-09-24 09:48:00.836');
INSERT INTO `users` VALUES (2, 'trongduc04@gmail.com', '0386693355', 'customer', 'local', NULL, '2025-09-24 09:55:45.959', NULL, 'trongduc04', '$2b$12$ufLrHxO44cjiSTakr0PAwem5izTlZh1wyX6qM0fx7eR8zZeHw7aKi', NULL, '2025-09-24 09:55:45.959');
INSERT INTO `users` VALUES (3, 'trongduc05@gmail.com', '0386693356', 'customer', 'local', NULL, '2025-09-24 09:57:34.484', NULL, 'trongduc05', '$2b$12$BDf9id7zVJSG8s5HxFJalupz4WLczxTK8zRBhcpbxRJzyylUdSmrC', NULL, '2025-09-24 09:57:34.484');

-- ----------------------------
-- Table structure for vnpay_transactions
-- ----------------------------
DROP TABLE IF EXISTS `vnpay_transactions`;
CREATE TABLE `vnpay_transactions`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `ipnParamsRaw` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `paymentId` bigint NOT NULL,
  `returnParamsRaw` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `vnpAmount` bigint NULL DEFAULT NULL,
  `vnpBankCode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `vnpOrderInfo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `vnpPayDate` varchar(14) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `vnpResponseCode` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `vnpSecureHash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `vnpTransactionNo` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `vnpTxnRef` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `vnpay_transactions_paymentId_idx`(`paymentId` ASC) USING BTREE,
  INDEX `vnpay_transactions_vnpTxnRef_idx`(`vnpTxnRef` ASC) USING BTREE,
  CONSTRAINT `vnpay_transactions_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of vnpay_transactions
-- ----------------------------
INSERT INTO `vnpay_transactions` VALUES (1, '2025-09-24 18:25:00.000', 'ipnraw', 1, 'returnraw', 11500000, 'NCB', 'Thanh toan don hang EMO0001', '20250924182500', '00', 'securehash-demo', '123456789', 'EMO-TXN-0001');

-- ----------------------------
-- Table structure for wishlist_items
-- ----------------------------
DROP TABLE IF EXISTS `wishlist_items`;
CREATE TABLE `wishlist_items`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `productId` bigint NOT NULL,
  `variantId` bigint NULL DEFAULT NULL,
  `wishlistId` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `wishlist_items_wishlistId_productId_variantId_key`(`wishlistId` ASC, `productId` ASC, `variantId` ASC) USING BTREE,
  INDEX `wishlist_items_productId_fkey`(`productId` ASC) USING BTREE,
  INDEX `wishlist_items_variantId_fkey`(`variantId` ASC) USING BTREE,
  CONSTRAINT `wishlist_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `wishlist_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `wishlist_items_wishlistId_fkey` FOREIGN KEY (`wishlistId`) REFERENCES `wishlists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of wishlist_items
-- ----------------------------
INSERT INTO `wishlist_items` VALUES (1, '2025-09-24 18:19:21.000', 1, 2, 1);
INSERT INTO `wishlist_items` VALUES (2, '2025-09-24 18:19:21.000', 3, 4, 1);

-- ----------------------------
-- Table structure for wishlists
-- ----------------------------
DROP TABLE IF EXISTS `wishlists`;
CREATE TABLE `wishlists`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `userId` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `wishlists_userId_key`(`userId` ASC) USING BTREE,
  CONSTRAINT `wishlists_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of wishlists
-- ----------------------------
INSERT INTO `wishlists` VALUES (1, '2025-09-24 18:18:57.000', 1);

SET FOREIGN_KEY_CHECKS = 1;
