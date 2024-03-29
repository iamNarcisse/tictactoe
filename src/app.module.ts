import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration, { dbConfig } from '@src/config/config';
import { ConfigModule } from '@nestjs/config';
import { BoardModule } from './board/board.mdule';
import { EventModule } from './event/event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      port: 5432,
      ...dbConfig,
      entities: [],
      synchronize: false,
    }),
    BoardModule,
    EventModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
