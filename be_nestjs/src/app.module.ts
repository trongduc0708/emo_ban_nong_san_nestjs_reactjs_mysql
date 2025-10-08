import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { PaymentModule } from './payment/payment.module';
import { CategoriesModule } from './categories/categories.module';
import { AddressesModule } from './addresses/addresses.module';
import { StaticModule } from './static/static.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule, 
    AuthModule, 
    ProductsModule, 
    CartModule, 
    PaymentModule, 
    CategoriesModule, 
    AddressesModule, 
    StaticModule, 
    WishlistModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
