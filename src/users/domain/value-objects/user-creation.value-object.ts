export class UserCreationValueObject {
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly googleId: string,
    public readonly isSuperAdmin: boolean,
  ) {}

  static create(props: {
    email: string;
    name: string;
    googleId: string;
    isSuperAdmin: boolean;
  }): UserCreationValueObject {
    return new UserCreationValueObject(
      props.email,
      props.name,
      props.googleId,
      props.isSuperAdmin,
    );
  }
}
