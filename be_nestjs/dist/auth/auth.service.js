"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    prisma;
    jwt;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async register(dto) {
        const { email, password, fullName, phone } = dto;
        if (!email || !password || !fullName)
            throw new common_1.BadRequestException({ error: 'Thiếu dữ liệu' });
        const exist = await this.prisma.user.findUnique({ where: { email } });
        if (exist)
            throw new common_1.BadRequestException({ error: 'Email đã được đăng ký' });
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                fullName,
                phone,
                role: 'customer',
                provider: 'local',
            },
            select: { id: true, email: true, fullName: true, phone: true, avatarUrl: true, role: true },
        });
        const safeUser = { ...user, id: Number(user.id) };
        return { success: true, user: safeUser };
    }
    async login(dto) {
        const { email, password } = dto;
        if (!email || !password)
            throw new common_1.BadRequestException({ error: 'Thiếu dữ liệu' });
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash)
            throw new common_1.UnauthorizedException({ error: 'Email hoặc mật khẩu không đúng' });
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException({ error: 'Email hoặc mật khẩu không đúng' });
        const payload = { userId: Number(user.id), email: user.email, role: user.role };
        const token = await this.jwt.signAsync(payload);
        const safeUser = {
            id: Number(user.id),
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            role: user.role,
        };
        return { success: true, token, user: safeUser };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map