import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class RegisterRequest {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class RegisterResponse {
  id: string;
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
  accessToken: string;
  refreshToken: string;
  userId: string;
  refreshTokenId: string;
}

export class ValidateRequest {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ValidateResponse {
  userId: string;
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
  accessToken: string;
  refreshToken: string;
}
