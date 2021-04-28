import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TRole } from '@/types';

/**
 * 角色守卫
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 从@Role拿到的role
    const _role = this.reflector.get<TRole>('role', context.getHandler());
    if (!_role) {
      return false;
    }
    const request = context.switchToHttp().getRequest();
    const { role } = request.query;
    return _role === role;
  }
}
