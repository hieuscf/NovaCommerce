import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { MeController } from './me.controller';
import { MetaController } from './meta.controller';
import { V1Controller } from './v1.controller';

@Module({
  controllers: [V1Controller, MeController, MetaController, AdminController],
})
export class V1Module {}
