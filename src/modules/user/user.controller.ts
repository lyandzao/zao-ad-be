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

  @Get('/splash/list')
  async getSplashList() {
    return this.userService.getSplashList();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/advertiser_finance/info')
  async getAdvertiserInfo(@Request() { user }) {
    return this.userService.getAdvertiserFinanceInfo(user.user_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/media_finance/info')
  async getMediaInfo(@Request() { user }) {
    return this.userService.getMediaFinanceInfo(user.user_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/admin_finance/info')
  async getAdminInfo(@Request() { user }) {
    return this.userService.getAdminFinanceInfo(user.user_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/recharge')
  async recharge(@Request() { user }, @Query() { amount }) {
    return this.userService.recharge(user.user_id, amount);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/recharge/list')
  async getRechargeList(@Request() { user }) {
    return this.userService.getRechargeList(user.user_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/withdraw')
  async withdraw(@Request() { user }, @Query() { amount }) {
    return this.userService.withdraw(user.user_id, amount);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/withdraw/list')
  async getWithdrawList(@Request() { user }) {
    return this.userService.getWithdrawList(user.user_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/review/recharge/list')
  async getReviewRechargeList() {
    return this.userService.getReviewRechargeList();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/review/recharge')
  async reviewRecharge(@Query() { user_id, order_id, status }) {
    return this.userService.reviewRecharge(user_id, order_id, status);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/review/withdraw/list')
  async getReviewWithdrawList() {
    return this.userService.getReviewWithdrawList();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/review/withdraw')
  async reviewWithdraw(@Query() { user_id, order_id, status }) {
    return this.userService.reviewWithdraw(user_id, order_id, status);
  }
}
