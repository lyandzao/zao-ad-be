import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CodeService } from './code.service';
import { CodeDTO, UpdateCodeDTO } from './code.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('/code')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Post('/create')
  async createCode(@Body() codeBody: CodeDTO, @Request() { user }) {
    return this.codeService.createCode(
      user.user_id,
      codeBody.app_id,
      codeBody.code_name,
      codeBody.code_type,
      codeBody.shield,
      codeBody.price,
      codeBody.date
    );
  }

  @Post('/update')
  async updateCode(@Body() codeBody: UpdateCodeDTO) {
    return this.codeService.updateCode(
      codeBody._id,
      codeBody.code_name,
      codeBody.shield,
    );
  }

  @Get('/list')
  async getCodeList(@Request() { user }) {
    return this.codeService.getCodeList(user.user_id);
  }

  @Get('/filter_list')
  async getCodeFilterList(@Query() { app_id }) {
    return this.codeService.getFilterCodeList(app_id);
  }

  @Get('/info')
  async getCodeInfo(@Query() { code_id }) {
    return this.codeService.getCodeInfo(code_id);
  }

  @Get('/codeName')
  async getCodeName(@Query() { code_id }) {
    return this.codeService.getCodeName(code_id);
  }

  @Get('/summary')
  async getCodeSummary(@Request() { user }) {
    return this.codeService.getCodeSummary(user.user_id);
  }

  @Get('/review/list')
  async getReviewCodeList() {
    return this.codeService.getReviewCodeList();
  }

  @Get('/review')
  async review(@Query() { code_id, status }) {
    return this.codeService.review(code_id, status);
  }
}
