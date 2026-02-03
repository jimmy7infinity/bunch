import { IsNumber, IsOptional, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateCodesDto {
  @IsNumber()
  @Min(1)
  @Max(100)
  count: number;

  @IsNumber()
  @Min(1)
  maxUses: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;
}
