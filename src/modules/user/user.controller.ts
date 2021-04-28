import {
  Controller,
  Get,
  Body,
  Patch,
  Query,
  UseGuards,
  Request,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from '../auth/auth.service';
import { LoginDTO, RegisterDTO } from './user.dto';
import { UserService } from './user.service';
import { saveFile } from '@/config/file';

@Controller('/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async login(@Body() loginBody: LoginDTO) {
    const res = await this.authService.validateUser(
      loginBody.username,
      loginBody.password,
    );
    return this.authService.certificate(res);
  }

  @Post('/register')
  @UseInterceptors(FileInterceptor('avatar'))
  async register(@Body() registerBody: RegisterDTO, @UploadedFile() avatar) {
    const avatarPath = saveFile(avatar);
    return this.userService.register({
      username: registerBody.username,
      password: registerBody.password,
      role: registerBody.role,
      name: registerBody.name,
      avatar: avatarPath,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/profile')
  async getUser(@Request() req) {
    return this.userService.findUserByUserName(req.user.username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/update')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUser(@Body() { name }, @Request() req, @UploadedFile() avatar) {
    let avatarPath: any = '';
    if (avatar) {
      avatarPath = saveFile(avatar);
    }
    return this.userService.updateUser(
      req.user.username,
      name,
      avatarPath as string,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/getMediaList')
  async getMediaList() {
    return this.userService.getMediaList();
  }
}
