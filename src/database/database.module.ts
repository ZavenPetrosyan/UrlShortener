import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME,
      autoIndex: false,
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    try {
      if (this.connection.readyState === 0) {
        console.log('Waiting for MongoDB connection...');
        await new Promise((resolve) => this.connection.once('open', resolve));
      }

      this.connection.set('debug', false);

      this.connection.on('error', (err) => {
        console.error('MongoDB Connection Error:', err);
      });
    } catch (error) {
      console.error('Error disabling MongoDB logs:', error);
    }
  }
}
