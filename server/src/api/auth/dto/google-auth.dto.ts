import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google ID token from client',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE4MmU0...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

export class GoogleUserDto {
  @ApiProperty({
    description: 'Google user ID',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  googleId: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User profile picture URL',
    example: 'https://lh3.googleusercontent.com/...',
    required: false,
  })
  @IsString()
  @IsOptional()
  picture?: string;
}
