import { UnauthorizedException } from '@nestjs/common';
import { ApiKeyAuthGuard } from './api-key-auth.guard';

describe('ApiKeyAuthGuard', () => {
  const reflector = {
    getAllAndOverride: () => undefined,
  };

  function createContext(headers: Record<string, string | undefined>) {
    return {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({
        getRequest: () => ({
          header: (name: string) => headers[name.toLowerCase()],
        }),
      }),
    } as never;
  }

  it('allows requests with a valid x-api-key', () => {
    const guard = new ApiKeyAuthGuard(
      { get: () => 'test-api-key' } as never,
      reflector,
    );

    expect(
      guard.canActivate(createContext({ 'x-api-key': 'test-api-key' })),
    ).toBe(true);
  });

  it('rejects requests without a valid API key', () => {
    const guard = new ApiKeyAuthGuard(
      { get: () => 'test-api-key' } as never,
      reflector,
    );

    expect(() => guard.canActivate(createContext({}))).toThrow(
      UnauthorizedException,
    );
  });
});
