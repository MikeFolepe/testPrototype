import { Logger, Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

@Module({
    imports: [],
    controllers: [],
    providers: [ChatGateway, Logger],
})
export class ChatGatewayModule {}
