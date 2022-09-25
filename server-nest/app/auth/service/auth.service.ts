import { UsersService } from '@app/users/service/users.service';
import { User } from '@common/user';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async login(userData: User): Promise<boolean> {
        const user = await this.usersService.findOne(userData.pseudonym);
        if (user) return false;
        await this.usersService.addUser(userData);
        return true;
    }
}
