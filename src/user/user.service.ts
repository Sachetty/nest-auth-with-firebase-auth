import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAdmin } from '../../config/firebase.setup';
import { UserDto } from './dto/user.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly admin: FirebaseAdmin,
  ) {}

  async createUser(userRequest: UserDto): Promise<any> {
    const { email, password, firstName, lastName, permissions } = userRequest;
    const app = this.admin.setup();

    try {
      const createdUser = await app.auth().createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });
      await app.auth().setCustomUserClaims(createdUser.uid, { permissions });
      return createdUser;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async signInUser(userRequest: SignInDto): Promise<any> {
    const { idToken } = userRequest;

    const expiresIn = 24 * 60 * 60 * 1000;

    const app = this.admin.setup();
    try {
      const claims = await app.auth().verifyIdToken(idToken);
      const sessionCookie = await app
        .auth()
        .createSessionCookie(idToken, { expiresIn });

      const options = { maxAge: expiresIn, httpOnly: true, secure: true };
      return { uid: claims.uid, sessionCookie, options };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
