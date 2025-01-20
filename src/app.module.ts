import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './featores/user-accounts/user-accounts.module';
import { BlogAccountsModule } from './featores/bloggers-platform/bloggers-platform.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://gromoj956:admin@expresslessons.oqics.mongodb.net/?retryWrites=true&w=majority&appName=expressLessons',
      {
        dbName: 'nest-cats',
      },
    ),
    UserAccountsModule,
    BlogAccountsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
