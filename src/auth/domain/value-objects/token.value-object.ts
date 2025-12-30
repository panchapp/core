import { CustomException } from '@/common/exceptions/custom.exception';

export class TokenValueObject {
  constructor(public readonly userId: string) {}

  static create(props: { userId: string }): TokenValueObject {
    return new TokenValueObject(props.userId);
  }

  static createFromUnknown(payload: unknown): TokenValueObject {
    if (typeof payload !== 'object' || payload === null) {
      throw CustomException.badRequest('Invalid token payload');
    }

    if (!('userId' in payload)) {
      throw CustomException.badRequest('Invalid token payload');
    }

    return new TokenValueObject(payload.userId as string);
  }
}
