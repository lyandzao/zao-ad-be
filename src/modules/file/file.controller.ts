import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body
} from '@nestjs/common';
import {
  FileInterceptor,
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { FileService } from './file.service';

@Controller('/file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file) {
    console.log(file);
    return file;
  }

  @Post('/uploads')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'background', maxCount: 1 },
    ]),
  )
  uploads(@UploadedFiles() files, @Body() body) {
    console.log(files, body);
    return files;
  }
}
