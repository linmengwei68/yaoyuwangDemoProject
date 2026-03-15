import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditTrailService } from '../audit-trail/audit-trail.service';

// @Injectable() 表示这个类可以被 Nest.js 的依赖注入系统管理
// 其他地方需要用它时，在 constructor 里声明即可，不用手动 new
@Injectable()
export class AuthService {
    constructor(
        // Nest.js 自动注入这两个服务（不需要你手动创建）
        private readonly prisma: PrismaService, // 操作数据库
        private readonly jwt: JwtService, // 生成/验证 JWT token
        private readonly auditTrailService: AuditTrailService,
    ) { }

    /**
     * 注册逻辑
     * 1. 检查邮箱是否已存在
     * 2. 加密密码
     * 3. 存入数据库
     */
    async checkEmailExists(email: string): Promise<{ exists: boolean }> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        return { exists: !!user };
    }

    async refreshToken(userId: number, email: string) {
        const payload = { sub: userId, email };
        return { access_token: await this.jwt.signAsync(payload) };
    }

    async register(email: string, password: string, roles: string[] = []) {
        // 查数据库看看这个邮箱是否已经注册过
        const existing = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existing) {
            // ConflictException → HTTP 409 Conflict
            // 前端收到 409 就知道"邮箱已存在"
            throw new ConflictException('该邮箱已注册');
        }

        // bcrypt.hash(明文密码, 加密轮数)
        // 轮数越高越安全但越慢，10 是业界推荐值
        // 加密后的结果类似："$2b$10$N9qo8uLOickgx2ZMRZoMye..."
        // 即使数据库被攻破，攻击者也无法还原出原始密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 写入数据库
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                roles: {
                    connect: roles.map((name) => ({ name })),
                },
            },
        });

        // 返回用户信息（不返回密码！）
        return {
            id: user.id,
            email: user.email,
            message: '注册成功',
        };
    }

    async registerWithAudit(
        email: string,
        password: string,
        roles: string[] = [],
        operator: { id: number; email: string },
    ) {
        const result = await this.register(email, password, roles);

        await this.auditTrailService.create({
            table: 'users',
            recordId: result.id,
            field: '[created]',
            oldValue: null,
            newValue: `${result.email} (roles: ${roles.join(', ') || 'none'})`,
            userId: operator.id,
            userEmail: operator.email,
        });

        return result;
    }

    /**
     * 登录逻辑
     * 1. 查找用户
     * 2. 验证密码
     * 3. 生成 JWT token
     */
    async login(email: string, password: string) {
        // 查数据库找用户
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // UnauthorizedException → HTTP 401 Unauthorized
            throw new UnauthorizedException('邮箱或密码错误');
        }

        // bcrypt.compare(输入的明文密码, 数据库里的加密密码)
        // 它会对输入密码做同样的加密，然后对比结果
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // 注意：不要告诉用户"密码错误"或"邮箱不存在"
            // 统一说"邮箱或密码错误"，防止攻击者试探哪些邮箱已注册
            throw new UnauthorizedException('邮箱或密码错误');
        }

        // 密码正确，生成 JWT token
        // payload 是存在 token 里的数据（不要放敏感信息，因为 token 可以被解码）
        const payload = {
            sub: user.id, // sub 是 JWT 标准字段，代表"主体"（即用户ID）
            email: user.email,
        };

        return {
            // jwt.sign() 会用密钥加签 payload，生成一个 token 字符串
            access_token: await this.jwt.signAsync(payload),
        };
    }

    /**
     * 获取当前用户信息
     * JwtAuthGuard 已经验证了 token 并把用户信息挂到了 request.user
     * 这里用 user.id 从数据库查完整信息返回（不返回密码）
     */
    async getCurrentUser(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                roles: {
                    select: {
                        id: true,
                        name: true,
                        permissions: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('no user existing');
        }

        return user;
    }
}
