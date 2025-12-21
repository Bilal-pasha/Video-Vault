import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    required: false,
    nullable: true,
  })
  avatar: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Authentication successful' })
  message: string;

  @ApiProperty({ type: () => Object })
  data: {
    user: UserResponseDto;
    token: string;
    refreshToken?: string;
  };
}
