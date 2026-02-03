import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class ActivateBetaDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^BUNCH-[A-Z2-9]{4}-[A-Z2-9]{2}$/, {
    message: 'Invalid invite code format. Expected format: BUNCH-XXXX-XX',
  })
  code: string;
}
