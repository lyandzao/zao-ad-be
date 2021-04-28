import { SetMetadata } from '@nestjs/common';
import { TRole } from '@/types';

// roles有media、advertiser、admin
export const Role = (role: TRole) => SetMetadata('role', role);
