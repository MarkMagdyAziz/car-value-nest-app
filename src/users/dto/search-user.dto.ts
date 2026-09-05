import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class SearchUserDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
