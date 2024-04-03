interface ILoginResponse {
  jwtToken: string;
  refreshToken: string;
  email: string;
  userName: string;
  jwtExpires: string;
  refreshExpires: string;
  isPasswordUpdatedByUser: boolean;
}
