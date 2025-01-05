import UserModel from "../../database/models/user.model";
import VerificationCodeModel from "../../database/models/verification.model";
import { ErrorCode } from "../../lib/enums/error-codes.enum";
import { VerificationEnum } from "../../lib/enums/verification-code.enum";
import { RegisterDto } from "../../lib/interface/auth.interface";
import { BadRequestException } from "../../lib/utils/catch-errors";
import { fortyFiveMinutesFromNow } from "../../lib/utils/date-time";

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
}
