import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  convertToKilograms(quantity: number, unit: string): number {
    if (!quantity) {
      throw new Error('Quantity is not defined');
    }

    if (!unit) {
      throw new Error('Unit is not defined');
    }

    // I limited to the most used units, but we could add all of them; and maybe also add the conversion from litre to kg
    switch (unit.toLowerCase()) {
      case 'kg':
        return quantity;
      case 'g':
        return quantity / 1000;
      case 'mg':
        return quantity / 1000000;
      default:
        throw new Error('Unit not valid or not implemented');
    }
  }
}
