import { Expose, Transform } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';

export class ReportDto {
  @Expose()
  id: number;
  @Expose()
  price: number;
  @Expose()
  year: number;
  @ApiHideProperty()
  lng: number;
  @Expose()
  lat: number;
  @Expose()
  make: string;
  @Expose()
  model: string;
  @Expose()
  mileage: number;
  @Expose()
  approved: boolean;

  @Transform(({ obj }: { obj: { user: { id: number } } }) => obj.user.id)
  @Expose()
  userId: number;
}
