import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
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
import { Response, Request } from 'express';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UnauthorizedDomainException } from '../../../core/exceptions/domain-exceptions';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private authQueryRepository: AuthQueryRepository,
  ) {}
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.usersService.registerUser(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    /*@Request() req: any*/
    @ExtractUserFromRequest() user: UserContextDto,
    @Res() response: Response,
    @Req() request: Request,
  ): Promise<void> {
    const ip = request.ip!;
    const userAgent = request.headers['user-agent'] || 'unknown';
    const loginDto = {
      userId: user.id,
      ip,
      userAgent,
    };
    const tokens = await this.authService.login(loginDto);
    response
      .cookie('refreshToken', tokens.refreshToken, {
        secure: true,
        httpOnly: true,
        // maxAge: 86400000,
      })
      //.send({ accessToken: tokens.accessToken });
      .json({ accessToken: tokens.accessToken });
    // return access_token;
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  async logout(
    @Res() response: Response,
    @Req() request: Request,
  ): Promise<void> {
    await this.authService.logout(request.cookies.refreshToken);
    response.clearCookie('refreshToken').sendStatus(204);
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
  @HttpCode(200)
  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  async refreshToken(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const ip = request.ip!;
    const cookieRefreshToken = request.cookies.refreshToken;
    debugger;
    const newTokens = await this.authService.refreshToken(
      ip,
      cookieRefreshToken,
    );
    response
      .cookie('refreshToken', newTokens.refreshToken, {
        secure: true,
        httpOnly: true,
        // maxAge: 86400000,
      })
      /*.send({ accessToken: newTokens.accessToken })
      .sendStatus(200);*/
      .json({ accessToken: newTokens.accessToken });
  }
}
