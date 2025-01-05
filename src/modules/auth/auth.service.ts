import UserModel from "../../database/models/user.model";
import VerificationCodeModel from "../../database/models/verification.model";
import { ErrorCode } from "../../lib/enums/error-codes.enum";
import { VerificationEnum } from "../../lib/enums/verification-code.enum";
import { LoginDto, RegisterDto } from "../../lib/interface/auth.interface";
import {
  BadRequestException,
  UnauthorizedException,
} from "../../lib/utils/catch-errors";
import {
  calculateExpirationDate,
  fortyFiveMinutesFromNow,
  ONE_DAY_IN_MS,
} from "../../lib/utils/date-time";
import SessionModel from "../../database/models/session.model";
import {
  refreshTokenSignOptions,
  signJwtToken,
  verifyJwtToken,
  RefreshTPayload,
} from "../../lib/utils/jwt";
import { config } from "../../config/app.config";

export class AuthService {
  public async register(registerData: RegisterDto) {
    const { name, email, password } = registerData;

    const existingUser = await UserModel.exists({
      email,
    });

    if (existingUser) {
      throw new BadRequestException(
        "User already exists",
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
      );
    }

    const newUser = await UserModel.create({
      name,
      email,
      password,
    });

    const userId = newUser._id;

    const verificationCode = await VerificationCodeModel.create({
      userId,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: fortyFiveMinutesFromNow(),
    });

    // Sending verification email link

    return {
      user: newUser,
    };
  }

  public async login(loginData: LoginDto) {
    const { email, password, userAgent } = loginData;

    const user = await UserModel.findOne({
      email,
    });

    if (!user) {
      throw new BadRequestException(
        "Invalid Email Address",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new BadRequestException(
        "Invalid email or password provided!",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    // Check if the user enabled 2fa return user = null

    const session = await SessionModel.create({
      userId: user._id,
      userAgent,
    });

    const accessToken = signJwtToken({
      userId: user._id,
      sessionId: session._id,
    });

    const refreshToken = signJwtToken(
      {
        sessionId: session._id,
      },
      refreshTokenSignOptions
    );

    return {
      user,
      accessToken,
      refreshToken,
      mfaRequired: false,
    };
  }

  public refreshToken = async (refreshToken: string) => {
    const { payload } = verifyJwtToken<RefreshTPayload>(refreshToken, {
      secret: refreshTokenSignOptions.secret,
    });

    if (!payload) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const session = await SessionModel.findById(payload.sessionId);
    const now = Date.now();

    if (!session) {
      throw new UnauthorizedException("Session does not exist!");
    }

    if (session.expiredAt.getTime() < now) {
      throw new UnauthorizedException("Session has expired!");
    }

    const sessionRequireRefresh =
      session.expiredAt.getTime() - now <= ONE_DAY_IN_MS;

    if (sessionRequireRefresh) {
      session.expiredAt = calculateExpirationDate(
        config.JWT.REFRESH_EXPIRES_IN
      );

      await session.save();
    }

    const newRefreshToken =
      sessionRequireRefresh &&
      signJwtToken(
        {
          sessionId: session._id,
        },
        refreshTokenSignOptions
      );

    const accessToken = signJwtToken({
      userId: session.userId,
      sessionId: session._id,
    });

    return {
      accessToken,
      newRefreshToken,
    };
  };

  public verifyEmail = async (code: string) => {
    const validCode = await VerificationCodeModel.findOne({
      code: code,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: { $gt: new Date() },
    });

    if (!validCode) {
      throw new BadRequestException("Invalid or expired verification code");
    }
  };
}
