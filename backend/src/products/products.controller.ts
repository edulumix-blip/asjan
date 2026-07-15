import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my/products')
  async getMyProducts(@GetUser('id') userId: string) {
    return this.productsService.getMyProducts(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Get('all')
  async getAllProducts(@Query() query: any) {
    return this.productsService.getAllProducts(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put(':id/toggle-availability')
  async toggleAvailability(@Param('id') id: string) {
    return this.productsService.toggleAvailability(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put(':id/toggle-featured')
  async toggleFeatured(@Param('id') id: string) {
    return this.productsService.toggleFeatured(id);
  }

  @Get()
  async getProducts(@Query() query: any) {
    return this.productsService.getProducts(query);
  }

  @Get('filter-options')
  async getProductFilterOptions() {
    return this.productsService.getProductFilterOptions();
  }

  @Get('featured')
  async getFeaturedProducts() {
    return this.productsService.getFeaturedProducts();
  }

  @Get('count')
  async getProductsCount() {
    return this.productsService.getProductsCount();
  }

  @Get('category/:category')
  async getProductsByCategory(@Param('category') category: string) {
    return this.productsService.getProductsByCategory(category);
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.productsService.getProduct(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'digital_product_poster')
  @Post()
  async createProduct(
    @GetUser() user: any,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.createProduct(createProductDto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'digital_product_poster')
  @Put(':id')
  async updateProduct(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, updateProductDto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'digital_product_poster')
  @Delete(':id')
  async deleteProduct(@GetUser() user: any, @Param('id') id: string) {
    return this.productsService.deleteProduct(id, user);
  }
}
