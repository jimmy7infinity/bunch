import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class MediaService {
  private readonly tenorApiKey: string;
  private readonly tenorBaseUrl = 'https://tenor.googleapis.com/v2';

  constructor() {
    this.tenorApiKey = process.env.TENOR_API_KEY || '';
    
    if (!this.tenorApiKey) {
      console.warn('⚠️ TENOR_API_KEY not set in environment variables');
    }
    
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
      api_key: process.env.CLOUDINARY_API_KEY || '',
      api_secret: process.env.CLOUDINARY_API_SECRET || '',
    });
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('⚠️ Cloudinary credentials not fully set in environment variables');
    }
  }

  async searchGifs(query: string, limit = 20) {
    try {
      const response = await axios.get(`${this.tenorBaseUrl}/search`, {
        params: {
          q: query,
          key: this.tenorApiKey,
          limit,
          media_filter: 'gif,tinygif',
        },
      });
      return response.data.results || [];
    } catch (error) {
      console.error('Failed to search GIFs:', error);
      throw new HttpException('Failed to search GIFs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getFeaturedGifs(limit = 20) {
    try {
      const response = await axios.get(`${this.tenorBaseUrl}/featured`, {
        params: {
          key: this.tenorApiKey,
          limit,
          media_filter: 'gif,tinygif',
        },
      });
      return response.data.results || [];
    } catch (error) {
      console.error('Failed to get featured GIFs:', error);
      throw new HttpException('Failed to get featured GIFs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'polybanter_chats',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new HttpException('Failed to upload image', HttpStatus.INTERNAL_SERVER_ERROR));
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new HttpException('Upload completed but no result returned', HttpStatus.INTERNAL_SERVER_ERROR));
          }
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}

