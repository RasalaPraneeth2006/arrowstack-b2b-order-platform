import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'; import { JwtService } from '@nestjs/jwt'; import { Role } from '@prisma/client'; import * as bcrypt from 'bcryptjs'; import { PrismaService } from './prisma.service';
@Injectable() export class AuthService { constructor(private db:PrismaService,private jwt:JwtService){}
 async register(d:{email:string;password:string;companyName:string}){const email=d.email.toLowerCase();if(await this.db.user.findUnique({where:{email}}))throw new ConflictException('Email already registered');const user=await this.db.user.create({data:{email,passwordHash:await bcrypt.hash(d.password,12),companyName:d.companyName,role:Role.BUYER}});return {user:this.publicUser(user),token:this.token(user)};}
 async login(email:string,password:string){const user=await this.db.user.findUnique({where:{email:email.toLowerCase()}});if(!user||!await bcrypt.compare(password,user.passwordHash))throw new UnauthorizedException('Invalid email or password');return {user:this.publicUser(user),token:this.token(user)};}
 private token(u:any){return this.jwt.sign({sub:u.id,email:u.email,role:u.role,companyName:u.companyName},{secret:process.env.JWT_SECRET,expiresIn:process.env.JWT_EXPIRES_IN||'1d'});}
 private publicUser(u:any){return {id:u.id,email:u.email,role:u.role,companyName:u.companyName};}
}
