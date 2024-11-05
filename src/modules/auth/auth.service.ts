import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { User } from '../../database/schemas/user.schema';
import { EmailService } from 'src/modules/email/email.service';
import { isEmailOrPhone } from 'src/common/helpers/validation.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    const { name, userName, passWord, rePassWord } = registerDto;
    if (passWord !== rePassWord) {
      throw new BadRequestException('Passwords do not match');
    }
    const existingUser = await this.UserModel.findOne({
      userName,
    });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(passWord, 10);
    const newUser = new this.UserModel({
      userName,
      name,
      passWord: hashedPassword,
    });
    await newUser.save();
    if (isEmailOrPhone(userName) === 'email')
      this.emailService.sendEmail(
        userName,
        'Welcome to Our Platform!',
        `<p>Hi ${name},</p><p>Welcome to our service! We are excited to have you on board.</p>`,
      );

    return { message: 'User registered successfully' };
  }
  async login(loginDto: LoginDto) {
    const { userName, passWord } = loginDto;
    const user = await this.UserModel.findOne({ userName });

    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    if (!(await bcrypt.compare(passWord, user.passWord))) {
      throw new BadRequestException('Incorrect password');
    }
    const payload = { userName: user.userName, sub: user._id };
    return { access_token: this.jwtService.sign(payload) };
  }
}
