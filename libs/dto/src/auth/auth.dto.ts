import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class RegisterRequest {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class RegisterResponse {
  @IsString({ message: 'id must be a string' })
  id: string;

  @IsEmail({}, { message: 'email must be a valid email' })
  email: string;
}

export class LoginRequest {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}

export class LoginResponse {
  @IsString({ message: 'accessToken must be a string' })
  accessToken: string;

  @IsString({ message: 'refreshToken must be a string' })
  refreshToken: string;

  @IsString({ message: 'userId must be a string' })
  userId: string;

  @IsString({ message: 'refreshTokenId must be a string' })
  refreshTokenId: string;
}

export class ValidateRequest {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ValidateResponse {
  @IsString({ message: 'userId must be a string' })
  userId: string;
  @IsBoolean({ message: 'valid must be a boolean' })
  valid: boolean;
}

export class RefreshRequest {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @IsString()
  @IsNotEmpty()
  refreshTokenId: string;
}

export class RefreshResponse {
  @IsString({ message: 'accessToken must be a string' })
  accessToken: string;

  @IsString({ message: 'refreshToken must be a string' })
  refreshToken: string;
}
