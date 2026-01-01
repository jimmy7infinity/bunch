import { Controller, Post, Body, Query, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaService } from './media.service';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('search-gifs')
  async searchGifs(@Query('q') query: string) {
    const gifs = await this.mediaService.searchGifs(query);
    return { results: gifs };
  }

  @Post('featured-gifs')
  async getFeaturedGifs() {
    const gifs = await this.mediaService.getFeaturedGifs();
    return { results: gifs };
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.mediaService.uploadImage(file);
    return { url };
  }
}

