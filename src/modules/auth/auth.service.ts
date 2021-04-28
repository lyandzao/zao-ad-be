import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  //  校验用户信息
  async validateUser(username: string, password: string) {
    const user = await this.userService.findUser(username, password);
    return user;
  }

  // jwt签证
  certificate(user) {
    const payload = {
      username: user.username,
      sub: user.username,
      role: user.role,
      user_id: user._id,
    };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
