import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @MinLength(6, { message: '密码长度不能少于 6 位' })
  password: string;
}

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'refresh_token 不能为空' })
  @IsString()
  refresh_token: string;
}
