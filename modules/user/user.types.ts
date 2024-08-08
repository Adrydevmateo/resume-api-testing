export type TUser = {
  id: string;
  email: string;
  password: string;
  token?: string;
};

export interface IUserServiceResponse<T> {
  OK: boolean;
  msg?: string;
  statusCode?: number;
  data?: T;
}
