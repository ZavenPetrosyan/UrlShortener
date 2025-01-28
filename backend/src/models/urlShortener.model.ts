import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { User } from './user.model';

export type UrlShortenerDocument = HydratedDocument<UrlShortener>;

@Schema({ timestamps: true })
export class UrlShortener {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  originalUrl: string;

  @Prop({ required: true })
  shortenedUrl: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;
}

export const UrlShortenerSchema = SchemaFactory.createForClass(UrlShortener);
