import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  Session,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { SignInDto } from './dto/sign-in.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  signup(@Body() userRequest: UserDto) {
    return this.userService.createUser(userRequest);
  }

  @Post('signin')
  @HttpCode(200)
  async signIn(
    @Body() userRequest: SignInDto,
    @Session() session: Record<string, any>,
    @Res({ passthrough: true }) response: Response,
  ): Promise<any> {
    const { uid, sessionCookie, options } =
      await this.userService.signInUser(userRequest);
    session['mfa_' + uid] = false;
    response.cookie('mfa_auth', false, options);
    response.cookie('session', sessionCookie, options);
    return { status: 'success' };
  }
}
