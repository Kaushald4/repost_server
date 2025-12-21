export interface UploadFileRequest {
  file: Uint8Array | Buffer;
  filename: string;
  mimetype: string;
  folder?: string;
}

export interface UploadFileResponse {
  url: string;
  publicId: string;
  success: boolean;
  message: string;
}
