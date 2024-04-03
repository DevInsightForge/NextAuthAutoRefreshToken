interface IUserInfoByToken {
  id: number;
  roleId: number;
  isActive: boolean;
  userName: string;
  roleName: string;
  email: string;
  isPasswordUpdatedByUser: boolean;
  passwordUpdatedDate: string;
}
