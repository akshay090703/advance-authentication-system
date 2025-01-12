import UserModel from "../../database/models/user.model";
import VerificationCodeModel from "../../database/models/verification.model";
import { ErrorCode } from "../../lib/enums/error-codes.enum";
import { VerificationEnum } from "../../lib/enums/verification-code.enum";
import {
  LoginDto,
  RegisterDto,
  resetPasswordDto,
} from "../../lib/interface/auth.interface";
import {
  BadRequestException,
  InternalServerException,
  NotFoundException,
  UnauthorizedException,
} from "../../lib/utils/catch-errors";
import {
  anHourFromNow,
  calculateExpirationDate,
  fortyFiveMinutesFromNow,
  ONE_DAY_IN_MS,
  threeMinutesAgo,
} from "../../lib/utils/date-time";
import SessionModel from "../../database/models/session.model";
import {
  refreshTokenSignOptions,
  signJwtToken,
  verifyJwtToken,
  RefreshTPayload,
} from "../../lib/utils/jwt";
import { config } from "../../config/app.config";
import { sendEmail } from "../../mailers/mailer";
import {
  passwordResetTemplate,
  verifyEmailTemplate,
} from "../../mailers/templates/template";
import { HttpException } from "../../lib/utils/catch-errors";
import { HTTPSTATUS } from "../../config/http.config";
import { hashValue } from "../../lib/utils/bcrypt";

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

    const verification = await VerificationCodeModel.create({
      userId,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: fortyFiveMinutesFromNow(),
    });

    // Sending verification email link
    const verificationUrl = `${config.APP_ORIGIN}/confirm-account?code=${verification.code}`;

    await sendEmail({
      to: newUser.email,
      ...verifyEmailTemplate(verificationUrl),
    });

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
    if (user.userPreferences.enable2FA) {
      return {
        user: null,
        mfaRequired: true,
        accessToken: "",
        refreshToken: "",
      };
    }

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

    const updatedUser = await UserModel.findByIdAndUpdate(
      validCode.userId,
      {
        isEmailVerified: true,
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      throw new BadRequestException(
        "Unable to verify email address",
        ErrorCode.VALIDATION_ERROR
      );
    }

    await validCode.deleteOne();

    return {
      user: updatedUser,
    };
  };

  public forgotPassword = async (email: string) => {
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    // check mail rate limit is 2 emails per 3 or 10 min
    const timeAgo = threeMinutesAgo();
    const maxAttempts = 2;

    const count = await VerificationCodeModel.countDocuments({
      userId: user._id,
      type: VerificationEnum.PASSWORD_RESET,
      createdAt: { $gt: timeAgo },
    });

    if (count >= maxAttempts) {
      throw new HttpException(
        "Too many request, try again later",
        HTTPSTATUS.TOO_MANY_REQUESTS,
        ErrorCode.AUTH_TOO_MANY_ATTEMPTS
      );
    }

    const expiresAt = anHourFromNow();
    const verification = await VerificationCodeModel.create({
      userId: user._id,
      type: VerificationEnum.PASSWORD_RESET,
      expiresAt,
    });

    const resetLink = `${config.APP_ORIGIN}/reset-password?code=${
      verification.code
    }&expiresAt=${expiresAt.getTime()}`;

    const { data, error } = await sendEmail({
      to: user.email,
      ...passwordResetTemplate(resetLink),
    });

    if (!data?.id) {
      throw new InternalServerException(`${error?.name} ${error?.message}`);
    }

    return {
      url: resetLink,
      emailId: data.id,
    };
  };

  public resetPassword = async ({
    password,
    verificationCode,
  }: resetPasswordDto) => {
    const validCode = await VerificationCodeModel.findOne({
      code: verificationCode,
      type: VerificationEnum.PASSWORD_RESET,
      expiresAt: { $gt: new Date() },
    });

    if (!validCode) {
      throw new NotFoundException("Invalid or expired verification code");
    }

    const hashedPassword = await hashValue(password);

    const updatedUser = await UserModel.findByIdAndUpdate(validCode.userId, {
      password: hashedPassword,
    });

    if (!updatedUser) {
      throw new BadRequestException("Unable to reset password");
    }

    await validCode.deleteOne();

    await VerificationCodeModel.deleteMany({
      userId: updatedUser._id,
    });

    await SessionModel.deleteMany({
      userId: updatedUser._id,
    });

    return {
      user: updatedUser,
    };
  };

  public logout = async (sessionId: string) => {
    return await SessionModel.findByIdAndDelete(sessionId);
  };
}
