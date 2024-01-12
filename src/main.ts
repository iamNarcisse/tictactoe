import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({ origin: '*' });
  await app.listen(5001);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
