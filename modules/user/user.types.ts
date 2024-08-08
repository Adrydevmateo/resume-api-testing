export type TUserType = "admin" | "common";

export type TUser = {
  id: string;
  email: string;
  password: string;
  token?: string;
  type?: TUserType;
};

export interface IUserServiceResponse<T> {
  OK: boolean;
  msg?: string;
  statusCode?: number;
  data?: T;
}
