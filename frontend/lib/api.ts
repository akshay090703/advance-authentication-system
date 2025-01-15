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

export const loginMutationFn = async (data: LoginType) => {
  return await API.post("/auth/login", data);
};

export const registerMutationFn = async (data: RegisterType) => {
  return await API.post("/auth/register", data);
};
