import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './application/auth.service';
import { CryptoService } from './application/crypto.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthController } from './api/auth.controller';
import { LocalStrategy } from './guards/local/local.strategy';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { BasicStrategy } from './guards/basic/basic.strategy';
import { DeviceController } from './api/security.controller';
import { DevicesService } from './application/devices.service';
import { DevicesRepository } from './infrastructure/devices.repository';
import { DeviceQueryRepository } from './infrastructure/query/device.query-repository';
import { Device, DeviceSchema } from './domain/device.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
    PassportModule,
    JwtModule.register({
      secret: 'access-token-secret',
      // signOptions: { expiresIn: '6m' },
    }),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController, DeviceController],
  providers: [
    UsersService,
    DevicesService,
    DevicesRepository,
    DeviceQueryRepository,
    UsersRepository,
    UsersQueryRepository,
    AuthQueryRepository,
    AuthService,
    // EmailService,
    CryptoService,
    LocalStrategy,
    JwtStrategy,
    BasicStrategy,
  ],
  exports: [MongooseModule, JwtStrategy, UsersRepository],
})
export class UserAccountsModule {}
