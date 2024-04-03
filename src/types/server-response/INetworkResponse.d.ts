interface INetworkResponse<IDataType = unknown> {
  message: string;
  data: IDataType;
}
