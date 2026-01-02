import { IsOptional, IsString, IsISO8601 } from 'class-validator';

export class JoinCommunityDto {
  @IsOptional()
  @IsString()
  message?: string;
}

export class BanMemberDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsISO8601()
  bannedUntil?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
