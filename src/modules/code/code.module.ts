import { CodeService } from './code.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Code, CodeSchema } from '@/schemas/code.schema';
import { CodeController } from './code.controller';
import { Buried, BuriedSchema } from '@/schemas/buried.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Code.name, schema: CodeSchema, collection: 'codes' },
      { name: Buried.name, schema: BuriedSchema, collection: 'buried' },
    ]),
  ],
  controllers: [CodeController],
  providers: [CodeService],
})
export class CodeModule {}
