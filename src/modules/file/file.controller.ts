import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterConfig } from '@/config/upload.config';
import * as path from 'path';
import { Response } from 'express';

@Controller('file')
export class FileController {
  constructor(private fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', MulterConfig))
  async UpLoadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const isImage = file.mimetype.startsWith('image');
    const isVideo = file.mimetype.startsWith('video');
    let processedPath, thumbnailPath;
    if (isImage) {
      processedPath = await this.fileService.processImage(file);
      thumbnailPath = await this.fileService.createThumbnail(file);
    } else if (isVideo) {
      processedPath = await this.fileService.processVideo(file);
      thumbnailPath = await this.fileService.createVideoThumbnail(file);
    }
    const savedFile = await this.fileService.saveFile(
      file.filename,
      processedPath,
      file.size,
      file.mimetype,
      thumbnailPath,
    );
    await this.fileService.deleteFileFromDisk(file.path);

    return { message: 'File uploaded successfully', file: savedFile };
  }

  @Get('getfile/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      filename,
    );
    res.sendFile(filePath);
  }
}
