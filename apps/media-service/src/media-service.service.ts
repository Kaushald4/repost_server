import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { UploadFileRequest, UploadFileResponse } from './media.dto';

@Injectable()
export class MediaServiceService {
  async uploadFile(data: UploadFileRequest): Promise<UploadFileResponse> {
    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: data.folder || 'repost_uploads',
        },
        (error, result) => {
          if (error && !result) {
            resolve({
              success: false,
              message: error.message,
              url: '',
              publicId: '',
            });
          } else {
            resolve({
              success: true,
              message: 'File uploaded successfully',
              url: result!.secure_url,
              publicId: result!.public_id,
            });
          }
        },
      );

      streamifier.createReadStream(Buffer.from(data.file)).pipe(uploadStream);
    });
  }
}
