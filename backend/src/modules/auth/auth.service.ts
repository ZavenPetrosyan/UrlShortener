import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../../models/user.model';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const { username, password } = dto;
    let user = await this.userModel.findOne({ username });

    if (!user) {
      console.log(`User not found, creating new user: ${username}`);

      const hashedPassword = await bcrypt.hash(password, 10);
      user = new this.userModel({ username, password: hashedPassword });

      await user.save();
      console.log(`New user created: ${username}`);
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new BadRequestException('Invalid credentials');
      }
    }

    const token = this.jwtService.sign({
      userId: user._id,
      username: user.username,
    });

    console.log(`JWT issued for user: ${username}`);
    return { accessToken: token };
  }
}
