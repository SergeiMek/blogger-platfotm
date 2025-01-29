import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { UserContextDto } from '../dto/user-context.dto';
import {
  BadRequestDomainException,
  UnauthorizedDomainException,
} from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }
  //validate возвращает то, что впоследствии будет записано в req.user
  async validate(username: string, password: string): Promise<UserContextDto> {
    if (typeof username !== 'string') {
      throw BadRequestDomainException.create('incorrect', 'loginOrEmail');
    }
    if (typeof password !== 'string') {
      throw BadRequestDomainException.create('incorrect', 'password');
    }
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw UnauthorizedDomainException.create();
      /// throw new Error(`not authorized`);
    }

    return user;
  }
}
