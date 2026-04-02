import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin, AdminDocument } from '../schemas/admin.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(email: string, password: string): Promise<any> {
    const admin = await this.adminModel.findOne({ email });
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { id: admin._id, email: admin.email, role: admin.role };
  }

  async login(email: string, password: string) {
    const admin = await this.validateAdmin(email, password);
    const payload = { email: admin.email, sub: admin.id, role: admin.role };
    
    return {
      access_token: this.jwtService.sign(payload),
      admin: { email: admin.email, role: admin.role },
    };
  }

  async createAdmin(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new this.adminModel({ email, password: hashedPassword });
    await admin.save();
    return { email: admin.email, role: admin.role };
  }
}
