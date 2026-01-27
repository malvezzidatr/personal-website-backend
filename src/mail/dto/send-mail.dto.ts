import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendMailDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
