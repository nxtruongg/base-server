import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from '@/database/schemas/file.schema';
import * as sharp from 'sharp';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';

@Injectable()
export class FileService {
  constructor(@InjectModel(File.name) private fileModel: Model<File>) {}

  async processImage(file: Express.Multer.File): Promise<string> {
    const compressedPath = `./uploads/compressed-${file.filename}`;
    await sharp(file.path)
      .jpeg({ quality: 60 }) // Giảm chất lượng hình ảnh xuống 60%
      .toFile(compressedPath);
    return compressedPath;
  }
  async createThumbnail(file: Express.Multer.File): Promise<string> {
    const thumbnailPath = `./uploads/thumbnail-${file.filename}`;
    await sharp(file.path)
      .resize({ width: 200, height: 200 })
      .toFile(thumbnailPath);

    return thumbnailPath;
  }

  async processVideo(file: Express.Multer.File): Promise<string> {
    const outputPath = `./uploads/compressed-${file.filename}`;
    return new Promise((resolve, reject) => {
      ffmpeg(file.path)
        .outputOptions([
          '-vf scale=720:-2', // Giảm độ phân giải xuống 720p
          '-c:v libx264', // Dùng codec H.264 (nhanh hơn H.265)
          '-crf 28', // Chất lượng nén hợp lý
          '-preset faster', // Tăng tốc độ nén
          //'-c:a aac', // Mã hóa âm thanh AAC
          // '-b:a 128k', // Giảm bitrate âm thanh
          //'-threads 2', // Sử dụng 2 threads CPU
        ])

        .save(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err));
    });
  }
  async createVideoThumbnail(file: Express.Multer.File): Promise<string> {
    const thumbnailPath = `./uploads/thumbnail-${file.filename}.jpg`;
    return new Promise((resolve, reject) => {
      ffmpeg(file.path)
        .screenshots({
          count: 1,
          folder: './uploads',
          filename: `thumbnail-${file.filename}.jpg`,
        })
        .on('end', () => resolve(thumbnailPath))
        .on('error', (err) => reject(err));
    });
  }

  async deleteFileFromDisk(filePath: string): Promise<void> {
    try {
      fs.unlinkSync(filePath); // Xóa file gốc sau khi đã nén
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  async saveFile(
    filename: string,
    path: string,
    size: number,
    type: string,
    thumbnailPath?: string,
  ): Promise<File> {
    const createdFile = new this.fileModel({
      filename,
      path,
      mimetype: type,
      size,
      thumbnailPath,
    });
    return createdFile.save();
  }

  async findAll(): Promise<File[]> {
    return this.fileModel.find().exec();
  }

  async findOne(id: string): Promise<File> {
    return this.fileModel.findById(id).exec();
  }

  async deleteFile(id: string): Promise<File> {
    return this.fileModel.findByIdAndDelete(id).exec();
  }
}
