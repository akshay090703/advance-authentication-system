export const thirtyDaysFromNow = (): Date => {
  const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return date;
};

export const fortyFiveMinutesFromNow = (): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 45);
  return now;
};
