import { IsEnum, IsOptional, IsString } from 'class-validator';

export class MediaDto {
  @IsString({ message: 'Media.url must be a valid URL' })
  @IsOptional()
  url?: string;

  @IsString({ message: 'Media.fileId must be a string' })
  @IsOptional()
  fileId?: string;

  @IsString()
  @IsEnum(['keep', 'delete', 'update', 'upsert'] as const)
  action: 'keep' | 'delete' | 'update' | 'upsert';
}

export type TMedia = MediaDto;
