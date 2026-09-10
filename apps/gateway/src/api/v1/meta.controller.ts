import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { EchoRequestDto } from '../../common/dto/echo-request.dto';

@ApiTags('Meta')
@Controller('_meta')
export class MetaController {
  @Post('echo')
  @HttpCode(200)
  @Public()
  @ApiOperation({ summary: 'Validate request DTO shape (infrastructure endpoint)' })
  echo(@Body() body: EchoRequestDto): { message: string } {
    return { message: body.message };
  }
}
