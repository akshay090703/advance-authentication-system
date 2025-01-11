import passport from "passport";
import { setupJwtStrategy } from "../lib/strategies/jwt.strategy";

const initializePassport = () => {
  setupJwtStrategy(passport);
};

initializePassport();
export default passport;
