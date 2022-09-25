import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
export class DatabaseServiceMock {
    mongoServer: MongoMemoryServer;
    mongoUri: string;
    database: mongoose.Mongoose;

    private options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as mongoose.ConnectOptions;

    constructor() {
        this.database = mongoose;
    }

    async start(): Promise<void> {
        this.mongoServer = await MongoMemoryServer.create();
        this.mongoUri = this.mongoServer.getUri();
        await this.database.connect(this.mongoUri, this.options).then(() => {
            // JUSTIFICATION : required in order to display the DB connection status
            // eslint-disable-next-line no-console
            console.log('Connected successfully to Mongodb Atlas');
        });
    }

    async closeConnection(): Promise<void> {
        await this.database.connection.close();
    }
}
