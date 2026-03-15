import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PostField } from '../common/types';

export interface GetJobPostsQuery {
  title?: string;
  filterStates?: string;
  filterPostedDates?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class JobPostService {
  constructor(private prisma: PrismaService) {}

  private buildWhere(query: GetJobPostsQuery) {
    const and: Prisma.JobPostWhereInput[] = [];

    if (query.title) {
      and.push({ title: { contains: query.title, mode: 'insensitive' } });
    }
    if (query.filterStates) {
      const states = query.filterStates.split(',').filter(Boolean);
      if (states.length) and.push({ state: { in: states as any } });
    }
    if (query.filterPostedDates) {
      const dates = query.filterPostedDates.split(',').filter(Boolean);
      if (dates.length) {
        and.push({
          OR: dates.map((d) => {
            const start = new Date(d + 'T00:00:00.000Z');
            const end = new Date(start.getTime() + 86400000);
            return { postedAt: { gte: start, lt: end } };
          }),
        });
      }
    }

    return and.length ? { AND: and } : {};
  }

  async getJobPosts(query: GetJobPostsQuery) {
    const { page = 1, pageSize = 20 } = query;
    const where = this.buildWhere(query);

    const [total, list] = await this.prisma.$transaction([
      this.prisma.jobPost.count({ where }),
      this.prisma.jobPost.findMany({
        where,
        orderBy: { postedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { total, list, page, pageSize };
  }

  async create(data: {
    title: string;
    jobDescription: string;
    questions: PostField[];
    postedBy: string;
    reviewer: string;
    userId: number;
  }) {
    const { reviewer, ...rest } = data;
    return this.prisma.jobPost.create({
      data: { ...rest, reviewer: reviewer ? [reviewer] : [] },
    });
  }

  async addReviewer(id: number, email: string) {
    const post = await this.prisma.jobPost.findUnique({ where: { id } });
    if (!post) return null;
    if (post.reviewer.includes(email)) return post;
    return this.prisma.jobPost.update({
      where: { id },
      data: { reviewer: { push: email } },
    });
  }

  async findById(id: number) {
    return this.prisma.jobPost.findUnique({ where: { id } });
  }

  async findByUserId(userId: number) {
    return this.prisma.jobPost.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
