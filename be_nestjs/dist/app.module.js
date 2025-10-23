"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const products_module_1 = require("./products/products.module");
const cart_module_1 = require("./cart/cart.module");
const payment_module_1 = require("./payment/payment.module");
const categories_module_1 = require("./categories/categories.module");
const addresses_module_1 = require("./addresses/addresses.module");
const static_module_1 = require("./static/static.module");
const wishlist_module_1 = require("./wishlist/wishlist.module");
const admin_module_1 = require("./admin/admin.module");
const upload_module_1 = require("./upload/upload.module");
const coupons_module_1 = require("./coupons/coupons.module");
const orders_module_1 = require("./orders/orders.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            products_module_1.ProductsModule,
            cart_module_1.CartModule,
            payment_module_1.PaymentModule,
            categories_module_1.CategoriesModule,
            addresses_module_1.AddressesModule,
            static_module_1.StaticModule,
            wishlist_module_1.WishlistModule,
            admin_module_1.AdminModule,
            upload_module_1.UploadModule,
            coupons_module_1.CouponsModule,
            orders_module_1.OrdersModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map