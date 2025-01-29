import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogAccountsModule } from './featores/bloggers-platform/bloggers-platform.module';
import { AllDeleteController } from './featores/testing/testing.controller';
import { UserAccountsModule } from './featores/user-accounts/user-accounts.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://gromoj95666666666666666666:admin15@cluster15-shard-00-00.nwksv.mongodb.net:27017,cluster15-shard-00-01.nwksv.mongodb.net:27017,cluster15-shard-00-02.nwksv.mongodb.net:27017/?ssl=true&replicaSet=atlas-vr1kaz-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster15',
      {
        dbName: 'nest-cats',
      },
    ),
    UserAccountsModule,
    BlogAccountsModule,
  ],
  controllers: [AppController, AllDeleteController],
  providers: [AppService],
})
export class AppModule {}
