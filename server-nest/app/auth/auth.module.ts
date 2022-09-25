import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from '@app/auth/controller/auth.controller';
import { UsersModule } from '@app/users/users.module';

@Module({
    providers: [AuthService],
    controllers: [AuthController],
    imports: [UsersModule],
})
export class AuthModule {}
