import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import bcrypt from 'bcrypt';
import { User, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { UsersRepository } from '../infrastructure/users.repository';
import { EmailService } from '../../notifications/email.service';
import {
  BadRequestDomainException,
  UnauthorizedDomainException,
} from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, passwordSalt);
    const userLogin = await this.usersRepository.findByLoginOrEmail(dto.login);
    const userEmail = await this.usersRepository.findByLoginOrEmail(dto.email);
    if (userEmail) {
      throw BadRequestDomainException.create(
        'the user already exists',
        'email',
      );
    }
    if (userLogin) {
      throw BadRequestDomainException.create(
        'the user already exists',
        'login',
      );
    }

    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordSalt: passwordSalt,
      passwordHash: passwordHash,
    });
    await this.usersRepository.save(user);
    return user._id.toString();
  }
  async deleteUser(id: string) {
    const user = await this.usersRepository.findOrNotFoundFail(id);
    user.makeDeleted();
    await this.usersRepository.save(user);
  }
  async registerUser(dto: CreateUserDto): Promise<any> {
    const findUserByLogin = await this.usersRepository.findByLoginOrEmail(
      dto.login,
    );
    const findUserByEmail = await this.usersRepository.findByLoginOrEmail(
      dto.email,
    );
    if (findUserByEmail) {
      throw BadRequestDomainException.create(
        'the user already exists',
        'email',
      );
    }
    if (findUserByLogin) {
      throw BadRequestDomainException.create(
        'the user already exists',
        'login',
      );
    }
    const confirmCode = uuidv4();
    const createdUserId = await this.createUser(dto);
    const user = await this.usersRepository.findOrNotFoundFail(createdUserId);
    user.setConfirmationCode(confirmCode);
    await this.usersRepository.save(user);
    try {
      await this.emailService.sendRegistrationEmail(dto.email, confirmCode);
    } catch {
      await this.usersRepository.deleteUserCompletely(user._id.toString());
      throw new HttpException('letter not sent', HttpStatus.BAD_REQUEST);
    }
  }
}
