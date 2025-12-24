import { IsOptional, IsString, IsUrl } from 'class-validator';

export class MediaDto {
  @IsString({ message: 'Media.url must be a valid URL' })
  @IsOptional()
  url: string | null;

  @IsString({ message: 'Media.fileId must be a string' })
  @IsOptional()
  fileId: string | null;
}

export type TMedia = MediaDto;
