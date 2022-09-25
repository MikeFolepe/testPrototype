/* eslint-disable no-console */
// JUSTIFICATION : required in order to display the DB and server connection status
import { Application } from '@app/app';
import { RoomManagerService } from '@app/services/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager.service';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Service } from 'typedi';
import { DatabaseService } from './services/database.service';

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private static readonly baseDix: number = 10;
    private server: http.Server;
    private socketManagerService: SocketManagerService;
    private roomManagerService: RoomManagerService;

    constructor(private readonly application: Application, private databaseService: DatabaseService) {}

    private static normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, this.baseDix) : val;
        if (isNaN(port)) {
            return val;
        } else if (port >= 0) {
            return port;
        } else {
            return false;
        }
    }
    async init(): Promise<void> {
        this.application.app.set('port', Server.appPort);
        this.server = http.createServer(this.application.app);
        this.roomManagerService = new RoomManagerService();
        this.socketManagerService = new SocketManagerService(this.server, this.roomManagerService);
        this.socketManagerService.handleSockets();
        try {
            this.server.listen(Server.appPort);
        } catch (error) {
            console.log('FAILED TO CONNECT SERVER: ' + error);
        }
        this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
        this.server.on('listening', () => this.onListening());
        await this.databaseService.start().catch((error) => {
            console.log('FAILED TO CONNECT DATABASE: ' + error);
            process.exit(1);
        });
    }

    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind: string = typeof Server.appPort === 'string' ? 'Pipe ' + Server.appPort : 'Port ' + Server.appPort;
        switch (error.code) {
            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /*
     * Occurs when the server listen on the port.
     */
    private onListening(): void {
        const addr = this.server.address() as AddressInfo;
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        console.log(`Listening on ${bind}`);
    }
}
