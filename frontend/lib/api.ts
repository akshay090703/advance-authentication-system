import API from "./axios-client";

type LoginType = {
  email: string;
  password: string;
};

type RegisterType = {
  email: string;
  password: string;
  name: string;
};

type ForgotPasswordType = {
  email: string;
};

type ResetPasswordType = {
  password: string;
  verificationCode: string;
};

type VerifyEmailType = {
  code: string;
};

export type MfaType = {
  message: string;
  secret: string;
  qrImageUrl: string;
};

type VerifyMFAType = {
  code: string;
  secretKey: string;
};

type MfaLoginType = {
  code: string;
  email: string;
};

type SessionType = {
  _id: string;
  userId: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

type SessionResponseType = {
  message: string;
  sessions: SessionType[];
};

export const loginMutationFn = async (data: LoginType) =>
  await API.post("/auth/login", data);

export const registerMutationFn = async (data: RegisterType) =>
  await API.post("/auth/register", data);

export const forgotPasswordMutationFn = async (data: ForgotPasswordType) =>
  await API.post("/auth/forgot-password", data);

export const resetPasswordMutationFn = async (data: ResetPasswordType) =>
  await API.post("/auth/reset-password", data);

export const verifyEmailMutationFn = async (data: VerifyEmailType) =>
  await API.post("/auth/verify-email", data);

export const logoutMutationFn = async () => await API.post(`/auth/logout`);

export const verifyMFALoginMutationFn = async (data: MfaLoginType) =>
  await API.post("mfa/verify-login", data);

export const mfaSetupQueryFn = async () => {
  const response = await API.get<MfaType>("/mfa/setup");
  return response.data;
};

export const verifyMFAMutationFn = async (data: VerifyMFAType) =>
  await API.post("/mfa/verify", data);

export const revokeMFAMutationFn = async () => await API.put("/mfa/revoke", {});

export const getUserSessionQueryFn = async () => await API.get("/session/");

export const sessionsQueryFn = async () => {
  const response = await API.get<SessionResponseType>("/session/all");
  return response.data;
};

export const sessionDeleteMutationFn = async (id: string) =>
  await API.delete(`/session/${id}`);
