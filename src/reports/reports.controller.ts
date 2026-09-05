import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GetEstimateReportDto } from './dto/estimate-report.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { ReportDto } from './dto/report.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { User } from '../users/entities/user.entity';
import { ApproveReportDto } from './dto/approve-report.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Get a price estimate for a car' })
  @ApiQuery({ name: 'make', required: true, type: String })
  @ApiQuery({ name: 'model', required: true, type: String })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'mileage', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { price: { type: 'number' } },
    },
  })
  @Get()
  getEstimate(@Query() query: GetEstimateReportDto) {
    return this.reportsService.createEstimate(query);
  }

  @ApiOperation({ summary: 'Create a new report (requires login)' })
  @ApiCookieAuth('session')
  @ApiCreatedResponse({ type: ReportDto })
  @ApiUnauthorizedResponse({ description: 'Not signed in' })
  @Post()
  @UseGuards(AuthGuard)
  @Serialize(ReportDto)
  createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
    return this.reportsService.create(body, user);
  }

  @ApiOperation({ summary: 'Approve or reject a report' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { affected: { type: 'number' } },
    },
  })
  @Patch('/:id')
  approveReport(@Param('id') id: number, @Body() body: ApproveReportDto) {
    return this.reportsService.changeApprovalStatus(id, body.approved);
  }
}
