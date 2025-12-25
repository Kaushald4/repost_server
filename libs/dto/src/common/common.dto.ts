import { IsEnum, IsOptional, IsString } from 'class-validator';

export class MediaDto {
  @IsString({ message: 'Media.url must be a valid URL' })
  @IsOptional()
  url: string | null;

  @IsString({ message: 'Media.fileId must be a string' })
  @IsOptional()
  fileId: string | null;

  @IsString()
  @IsEnum(['keep', 'delete', 'upsert'] as const)
  action: 'keep' | 'delete' | 'upsert';
}

export type TMedia = MediaDto;
