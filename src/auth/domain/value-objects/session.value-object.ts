import { TokenValueObject } from '@/auth/domain/value-objects/token.value-object';

export class SessionValueObject extends TokenValueObject {
  constructor(public readonly userId: string) {
    super(userId);
  }

  static create(props: { userId: string }): SessionValueObject {
    return new SessionValueObject(props.userId);
  }
}
