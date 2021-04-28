import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { logger } from '@/common/middleware/logger.middleware';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filters';
import { ResponseInterceptor } from '@/common/interceptor/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(logger);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useStaticAssets('public');
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 设置swagger文档相关配置
  const swaggerOptions = new DocumentBuilder()
    .setTitle('zao-ad api document')
    .setDescription('zao-ad project api document')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('/doc', app, document);

  await app.listen(8080);
}
bootstrap();
