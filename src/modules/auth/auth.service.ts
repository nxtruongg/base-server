import { isEmailOrPhone } from '@/common/helpers/validation.util';
import { IUserRequest } from '@/common/interfaces/user-request.interfaces';
import { User } from '@/database/schemas/user.schema';
import { EmailService } from '@/modules/email/email.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { CreateUserDto } from '../lists/user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginGoogleDto } from './dto/login-google.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async checkExistUser(userName: string) {
    const user = await this.UserModel.findOne({ userName });
    return user;
  }
  async createUser(createUserDto: CreateUserDto) {
    try {
      const { userName, passWord, name, authProvider } = createUserDto;
      const hashedPassword = passWord && (await bcrypt.hash(passWord, 10));

      const newUser = new this.UserModel({
        userName,
        name,
        passWord: hashedPassword,
        authProvider: authProvider || 'local',
      });
      const savedUser = await newUser.save();
      return savedUser;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async createToken(payload: IUserRequest) {
    return { access_token: this.jwtService.sign(payload) };
  }

  async register(registerDto: RegisterDto): Promise<any> {
    const { name, userName, passWord, rePassWord } = registerDto;
    if (passWord !== rePassWord) {
      throw new BadRequestException('Passwords do not match');
    }
    const existingUser = await this.checkExistUser(userName);

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }
    await this.createUser({ userName, name, passWord });
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
    const user = await this.checkExistUser(userName);
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    if (!(await bcrypt.compare(passWord, user.passWord))) {
      throw new BadRequestException('Incorrect password');
    }
    const payload = {
      userName: user.userName,
      userId: user._id,
      iat: Math.floor(Date.now() / 1000),
    };
    return await this.createToken(payload);
  }
  async loginByGoogle(loginGoogleDTo: LoginGoogleDto) {
    const { email, name, passWord } = loginGoogleDTo;
    let existingUser = await this.checkExistUser(email);

    if (!existingUser) {
      existingUser = await this.createUser({
        userName: email,
        name,
        passWord,
        authProvider: 'google',
      });
    }

    return await this.createToken({
      userName: email,
      userId: existingUser._id,
      iat: Math.floor(Date.now() / 1000),
    });
  }
}
