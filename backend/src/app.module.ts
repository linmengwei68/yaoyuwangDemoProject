import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { DictionaryModule } from './dictionary/dictionary.module';
import { AuditTrailModule } from './audit-trail/audit-trail.module';
import { PermissionsModule } from './permissions/permissions.module';
import { JobPostTemplateModule } from './job-post-template/job-post-template.module';
import { JobPostModule } from './job-post/job-post.module';
import { ApplicantInfoModule } from './applicant-info/applicant-info.module';
import { UploadModule } from './upload/upload.module';
import { ApplicationModule } from './application/application.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    RolesModule,
    UsersModule,
    DictionaryModule,
    AuditTrailModule,
    PermissionsModule,
    JobPostTemplateModule,
    JobPostModule,
    ApplicantInfoModule,
    UploadModule,
    ApplicationModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
