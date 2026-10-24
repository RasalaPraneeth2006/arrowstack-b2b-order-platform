import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();

    // Check cookie first, fallback to Authorization Bearer header
    let token = req.cookies?.access_token;
    if (!token && req.headers?.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedException('Authentication required. Please sign in.');
    }

    try {
      const secret = process.env.JWT_SECRET || 'replace_with_a_long_random_secret_at_least_32_chars';
      const payload = this.jwt.verify(token, { secret });
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Session expired or invalid token. Please sign in again.');
    }
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest();
    if (!req.user || !requiredRoles.includes(req.user.role)) {
      throw new ForbiddenException(
        `Insufficient privileges: this resource requires one of [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}
