import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DigitalProduct, DigitalProductSchema } from './schemas/product.schema';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DigitalProduct.name, schema: DigitalProductSchema },
    ]),
    UsersModule,
    AuthModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
