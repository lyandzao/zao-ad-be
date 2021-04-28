import { HttpException, HttpStatus } from '@nestjs/common';
import * as moment from 'moment';

export const throwException = (
  error?: string,
  statusCode?: HttpStatus,
  message?: string,
) => {
  const _error = error ? error : '错误请求,请重试';
  const _message = message ? message : _error;
  const _statusCode = statusCode ? statusCode : HttpStatus.BAD_REQUEST;
  throw new HttpException({ error: _error, message: _message }, _statusCode);
};

export const getTime = (tag: 'yesterday' | 'week' | 'month') => {
  const now = moment().format('YYYY-MM-DD');
  switch (tag) {
    case 'yesterday':
      return {
        start: moment().subtract(1, 'days').format('YYYY-MM-DD'),
        end: moment().subtract(1, 'days').format('YYYY-MM-DD'),
      };
    case 'week':
      return {
        start: moment().subtract(6, 'days').format('YYYY-MM-DD'),
        end: now,
      };
    case 'month':
      return {
        start: moment().startOf('month').format('YYYY-MM-DD'),
        end: now,
      };
    default:
      break;
  }
};
