import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { EmailService } from '../../notifications/email.service';
import { BadRequestDomainException } from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private emailService: EmailService,
  ) {}
  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    //// проверка на правильность пароля
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.cryptoService.comparePasswords(
      password,
      user.accountData.passwordHash,
      user.accountData.passwordSalt,
    );
    if (!isPasswordValid) {
      return null;
    }

    return { id: user.id.toString() };
  }

  async login(userId: string) {
    const accessToken = this.jwtService.sign({ id: userId } as UserContextDto);

    return {
      accessToken,
    };
  }
  async sendPasswordRecoveryCode(email: string) {
    const user = await this.usersRepository.findByLoginOrEmail(email);
    if (!user) {
      throw new HttpException('ok', HttpStatus.NO_CONTENT);
    }
    const recoveryCode = uuidv4();
    const expirationDate = add(new Date(), { hours: 1 });

    try {
      await this.emailService.sendChangePasswordEmail(
        user.accountData.email,
        recoveryCode,
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
    user.updatePasswordRecoveryData(expirationDate, recoveryCode);
    await this.usersRepository.save(user);
  }
  async changePassword(recoveryCode: string, password: string): Promise<void> {
    const user =
      await this.usersRepository.findUserByPasswordRecoveryCode(recoveryCode);
    if (!user) {
      throw new HttpException('user non found', HttpStatus.BAD_REQUEST);
    }
    const newPasswordData =
      await this.cryptoService.createPasswordHash(password);
    user.updatePassword(newPasswordData.salt, newPasswordData.hash);
    await this.usersRepository.save(user);
  }
  async confirmEmail(code: string): Promise<void> {
    const user = await this.usersRepository.findUserByConfirmCode(code);
    if (!user) {
      throw BadRequestDomainException.create('the user already exists', 'code');
    }
    if (user.emailConfirmation.isConfirmed) {
      throw BadRequestDomainException.create('user is confirmed', 'code');
    }
    if (user.emailConfirmation.expirationData! < new Date()) {
      throw BadRequestDomainException.create(
        'the deadline has expired',
        'code',
      );
    }
    user.updateConfirmationStatus();
    await this.usersRepository.save(user);
  }
  async resendConfirmationCode(email: string): Promise<void> {
    const user = await this.usersRepository.findByLoginOrEmail(email);
    if (!user) {
      throw BadRequestDomainException.create('user not found', 'email');
    }
    if (user.emailConfirmation.isConfirmed) {
      throw BadRequestDomainException.create('user is confirmed', 'email');
    }
    const newConfirmationCode = uuidv4();
    try {
      await this.emailService.sendChangePasswordEmail(
        user.accountData.email,
        newConfirmationCode,
      );
    } catch (error) {
      throw BadRequestDomainException.create(error, 'email');
    }
    user.updateConfirmationCode(newConfirmationCode);
    await this.usersRepository.save(user);
  }
}
