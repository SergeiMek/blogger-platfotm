import { configModule } from './confid';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogAccountsModule } from './featores/bloggers-platform/bloggers-platform.module';
import { AllDeleteController } from './featores/testing/testing.controller';
import { UserAccountsModule } from './featores/user-accounts/user-accounts.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL || '', {
      dbName: 'nest-cats',
    }),
    configModule,
    UserAccountsModule,
    BlogAccountsModule,
  ],
  controllers: [AppController, AllDeleteController],
  providers: [AppService],
})
export class AppModule {}
