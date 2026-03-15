import { Controller, Post, Get, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApplicationAnswer } from '../common/types';

@Controller('api/applications')
export class ApplicationController {
  constructor(private readonly service: ApplicationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() body: { jobPostId: number; answers: ApplicationAnswer[] },
    @Request() req: { user: { id: number } },
  ) {
    return this.service.create({
      userId: req.user.id,
      jobPostId: body.jobPostId,
      answers: body.answers,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('check')
  async check(
    @Query('jobPostId') jobPostId: string,
    @Request() req: { user: { id: number } },
  ) {
    const app = await this.service.findByUserAndPost(req.user.id, parseInt(jobPostId, 10));
    return { applied: !!app, application: app };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async my(@Request() req: { user: { id: number } }) {
    return this.service.findByUser(req.user.id);
  }
}
