import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { DashboardService, DashboardStats, MonthlyNavigationStats } from './dashboard.service';
import { User } from '../users/entities/user.entity';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard overview with current month and yearly stats' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard stats retrieved successfully',
  })
  @ApiQuery({ name: 'year', required: false, description: 'Year for dashboard data' })
  async getDashboard(@GetUser() user: User, @Query('year') year?: string): Promise<DashboardStats> {
    const targetYear = year ? Number.parseInt(year, 10) : undefined;
    return this.dashboardService.getDashboardStats(user.id, targetYear);
  }

  @Get('monthly/:year/:month')
  @ApiOperation({ summary: 'Get monthly dashboard stats with projections' })
  @ApiResponse({
    status: 200,
    description: 'Monthly dashboard stats retrieved successfully',
  })
  async getMonthlyStats(
    @GetUser() user: User,
    @Param('year') year: string,
    @Param('month') month: string,
  ): Promise<MonthlyNavigationStats> {
    return this.dashboardService.getMonthlyDashboardStats(
      user.id,
      Number.parseInt(year, 10),
      Number.parseInt(month, 10),
    );
  }
}
