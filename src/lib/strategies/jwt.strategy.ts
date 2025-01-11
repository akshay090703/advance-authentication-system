import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptionsWithRequest,
} from "passport-jwt";
import { UnauthorizedException } from "../utils/catch-errors";
import { ErrorCode } from "../enums/error-codes.enum";
import { config } from "../../config/app.config";
import passport, { PassportStatic } from "passport";
import { userService } from "../../modules/user/user.module";
import { NextFunction, Request, Response } from "express";

interface JwtPayload {
  userId: string;
  sessionId: string;
}

const options: StrategyOptionsWithRequest = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req) => {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) {
        throw new UnauthorizedException(
          "Unauthorized access token",
          ErrorCode.AUTH_TOKEN_NOT_FOUND
        );
      }

      return accessToken;
    },
  ]),

  secretOrKey: config.JWT.SECRET,
  audience: ["user"],
  algorithms: ["HS256"],
  passReqToCallback: true,
};

export const setupJwtStrategy = (passport: PassportStatic) => {
  passport.use(
    new JwtStrategy(options, async (req, payload: JwtPayload, done) => {
      try {
        const user = await userService.findUserById(payload.userId);

        if (!user) {
          return done(null, false);
        }

        req.sessionId = payload.sessionId;

        return done(null, user);
      } catch (error) {
        // console.error(error);

        return done(error, false);
      }
    })
  );
};

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          message: "Unauthorized access. Please log in again.",
          error: info?.message || "Authentication failed",
        });
      }

      req.user = user;
      next();
    }
  )(req, res, next);
};
