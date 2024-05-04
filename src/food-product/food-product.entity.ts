import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { FoodIngredient } from './dto/food-product.dto';

@Entity('food_product')
export class FoodProduct extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
    unique: true,
  })
  name: string;

  @Column({
    type: 'float',
    nullable: true,
  })
  carbonFootprint: number;

  @Column({
    nullable: false,
    type: 'jsonb',
  })
  ingredients: FoodIngredient[];

  constructor(init?: Partial<FoodProduct>) {
    super();
    Object.assign(this, init);
  }
}
