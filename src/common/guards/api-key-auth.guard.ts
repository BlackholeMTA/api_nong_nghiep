import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_ROUTE } from '../decorators/public.decorator';
import { REQUIRED_PERMISSIONS } from '../decorators/require-permissions.decorator';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_ROUTE,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const configuredApiKey = this.configService.get<string>('API_KEY');

    if (!configuredApiKey) {
      throw new UnauthorizedException('API_KEY is not configured');
    }

    if (this.extractApiKey(request) !== configuredApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    this.ensureRequiredPermissions(context, request);
    return true;
  }

  private extractApiKey(request: Request): string | undefined {
    const headerApiKey = request.header('x-api-key');

    if (headerApiKey) {
      return headerApiKey;
    }

    const authorization = request.header('authorization');

    if (authorization?.startsWith('Bearer ')) {
      return authorization.slice('Bearer '.length);
    }

    return undefined;
  }

  private ensureRequiredPermissions(
    context: ExecutionContext,
    request: Request,
  ): void {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PERMISSIONS,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return;
    }

    const grantedPermissions = new Set(
      request
        .header('x-user-permissions')
        ?.split(',')
        .map((permission) => permission.trim())
        .filter(Boolean) ?? [],
    );

    const hasAllPermissions = requiredPermissions.every((permission) =>
      grantedPermissions.has(permission),
    );

    if (!hasAllPermissions) {
      throw new UnauthorizedException('Missing required permission');
    }
  }
}
