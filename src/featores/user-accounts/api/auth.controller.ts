import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { AuthService } from '../application/auth.service';
import {
  ConfirmationCodeInputDto,
  CreateUserInputDto,
  EmailResendingInputDto,
  NewPasswordInputDto,
  RecoveryPasswordInputDto,
} from './input-dto/users.input-dto';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { MeViewDto } from './view-dto/users.view-dto';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';

@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private authQueryRepository: AuthQueryRepository,
  ) {}
  @Post('registration')
  registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.usersService.registerUser(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  login(
    /*@Request() req: any*/
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.authQueryRepository.me(user.id);
  }
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  passwordRecovery(
    /*@Request() req: any*/
    @Body() body: RecoveryPasswordInputDto,
  ): Promise<void> {
    return this.authService.sendPasswordRecoveryCode(body.email);
  }
  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  newPassword(
    /*@Request() req: any*/
    @Body() body: NewPasswordInputDto,
  ): Promise<void> {
    return this.authService.changePassword(body.recoveryCode, body.newPassword);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationConfirmation(
    /*@Request() req: any*/
    @Body() body: ConfirmationCodeInputDto,
  ): Promise<void> {
    return this.authService.confirmEmail(body.code);
  }
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  registrationEmailResending(
    /*@Request() req: any*/
    @Body() body: EmailResendingInputDto,
  ): Promise<void> {
    return this.authService.resendConfirmationCode(body.email);
  }
}
