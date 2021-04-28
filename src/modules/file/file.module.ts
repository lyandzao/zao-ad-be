import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { MulterModule } from '@nestjs/platform-express';
import { filesOptions } from '@/config/file';

@Module({
  imports:[
    MulterModule.register(filesOptions),
  ],
  controllers: [FileController],
  providers: [FileService]
})
export class FileModule {}