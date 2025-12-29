export class UserFindAllValueObject {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly searchValue?: string,
    public readonly isSuperAdmin?: boolean,
  ) {}

  static create(props: {
    page: number;
    limit: number;
    searchValue?: string;
    isSuperAdmin?: boolean;
  }): UserFindAllValueObject {
    return new UserFindAllValueObject(
      props.page,
      props.limit,
      props.searchValue,
      props.isSuperAdmin,
    );
  }
}
