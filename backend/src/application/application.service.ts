import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationAnswer } from '../common/types';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async create(data: { userId: number; jobPostId: number; answers: ApplicationAnswer[] }) {
    const existing = await this.prisma.application.findUnique({
      where: { userId_jobPostId: { userId: data.userId, jobPostId: data.jobPostId } },
    });
    if (existing) {
      throw new ConflictException('You have already applied to this post');
    }
    return this.prisma.application.create({ data });
  }

  async findByUserAndPost(userId: number, jobPostId: number) {
    return this.prisma.application.findUnique({
      where: { userId_jobPostId: { userId, jobPostId } },
    });
  }

  async findByUser(userId: number) {
    return this.prisma.application.findMany({
      where: { userId },
      select: { jobPostId: true },
    });
  }
}
