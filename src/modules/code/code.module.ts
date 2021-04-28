import { CodeService } from './code.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Code, CodeSchema } from '@/schemas/code.schema';
import { CodeController } from './code.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Code.name, schema: CodeSchema, collection: 'codes' },
    ]),
  ],
  controllers: [CodeController],
  providers: [CodeService],
})
export class CodeModule {}
