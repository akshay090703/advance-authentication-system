import { add } from "date-fns";

export const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export const thirtyDaysFromNow = (): Date => {
  const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return date;
};

export const fortyFiveMinutesFromNow = (): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 45);
  return now;
};

export const threeMinutesAgo = (): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - 3);
  return now;
};

export const anHourFromNow = (): Date => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  return now;
};

export const tenMinutesAgo = (): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - 10);
  return now;
};

export const calculateExpirationDate = (expiresIn: string = "15m"): Date => {
  // Match number + unit (m = minutes, h = hours, d = days)
  const match = expiresIn.match(/^(\d+)([mhd])$/);
  if (!match) {
    throw new Error("Invalid format. Use '15m', '1h', or '2d'.");
  }

  const [, value, unit] = match;
  const expirationDate = new Date();

  // Check the unit and apply accordingly
  switch (unit) {
    case "m":
      return add(expirationDate, { minutes: parseInt(value) });
    case "h": // hours
      return add(expirationDate, { hours: parseInt(value) });
    case "d": // days
      return add(expirationDate, { days: parseInt(value) });
    default:
      throw new Error('Invalid unit. Use "m", "h", or "d".');
  }
};
