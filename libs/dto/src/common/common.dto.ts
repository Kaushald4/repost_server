import { IsString, IsUrl } from 'class-validator';

export class MediaDto {
  @IsUrl({}, { message: 'Media.url must be a valid URL' })
  url: string;

  @IsString({ message: 'Media.fileId must be a string' })
  fileId: string;
}

export type TMedia = MediaDto;
