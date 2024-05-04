import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { FoodProductService } from './food-product.service';
import { CreateFoodProductDto } from './dto/food-product.dto';
import { FoodProduct } from './food-product.entity';

@Controller('food-products')
export class FoodProductController {
  constructor(private readonly foodProductService: FoodProductService) {}

  @Get(':name')
  getFoodProduct(@Param('name') name: string): Promise<FoodProduct> {
    Logger.log(
      `[food-products] [GET] FoodProduct: getting food product ${name}`,
    );
    return this.foodProductService.findByName(name);
  }

  @Post()
  createFoodProduct(
    @Body(ValidationPipe) product: CreateFoodProductDto,
  ): Promise<FoodProduct> {
    Logger.log(
      `[food-products] [POST] FoodProduct: product ${product.name} created`,
    );
    return this.foodProductService.createFoodProduct(product);
  }
}
