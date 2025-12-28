export class UserUpdateValueObject {
  constructor(
    public readonly email?: string,
    public readonly name?: string,
    public readonly googleId?: string,
    public readonly isSuperAdmin?: boolean,
  ) {}

  static create(props: {
    email?: string;
    name?: string;
    googleId?: string;
    isSuperAdmin?: boolean;
  }): UserUpdateValueObject {
    return new UserUpdateValueObject(
      props.email,
      props.name,
      props.googleId,
      props.isSuperAdmin,
    );
  }
}
