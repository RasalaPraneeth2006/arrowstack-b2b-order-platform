import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from './prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    jwt = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should successfully register a new buyer with hashed password', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(({ data }: any) =>
        Promise.resolve({
          id: 'user-123',
          email: data.email,
          role: data.role,
          companyName: data.companyName,
          passwordHash: data.passwordHash,
        }),
      );

      const result = await service.register({
        email: 'buyer@test.local',
        password: 'Password123!',
        companyName: 'Acme Test Corp',
      });

      expect(result.user.email).toBe('buyer@test.local');
      expect(result.user.companyName).toBe('Acme Test Corp');
      expect(result.user.role).toBe('BUYER');
      expect(result.token).toBe('mock-jwt-token');
      expect(prisma.user.create).toHaveBeenCalled();

      // Verify password was hashed (not stored plaintext)
      const createCall = prisma.user.create.mock.calls[0][0];
      expect(createCall.data.passwordHash).not.toBe('Password123!');
      const isValidHash = await bcrypt.compare('Password123!', createCall.data.passwordHash);
      expect(isValidHash).toBe(true);
    });

    it('should throw ConflictException if email is already taken', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-id', email: 'taken@test.local' });

      await expect(
        service.register({
          email: 'taken@test.local',
          password: 'Password123!',
          companyName: 'Duplicate Corp',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should successfully log in with valid credentials', async () => {
      const hash = await bcrypt.hash('Secret123!', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@test.local',
        passwordHash: hash,
        role: 'BUYER',
        companyName: 'Test Inc',
      });

      const result = await service.login('user@test.local', 'Secret123!');
      expect(result.user.id).toBe('user-1');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      const hash = await bcrypt.hash('RealSecret123!', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@test.local',
        passwordHash: hash,
        role: 'BUYER',
        companyName: 'Test Inc',
      });

      await expect(
        service.login('user@test.local', 'WrongPassword!'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login('nonexistent@test.local', 'AnyPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
