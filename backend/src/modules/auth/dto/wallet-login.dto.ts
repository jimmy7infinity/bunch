import { IsString, IsNotEmpty } from 'class-validator';

export class WalletLoginDto {
  @IsString()
  @IsNotEmpty()
  wallet_address: string;

  @IsString()
  @IsNotEmpty()
  signature: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}





