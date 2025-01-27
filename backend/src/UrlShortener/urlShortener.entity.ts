import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UrlShortenerDocument = HydratedDocument<UrlShortener>;

@Schema({ timestamps: true })
export class UrlShortener {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  originalUrl: string;

  @Prop({ required: true })
  shortenedUrl: string;

  @Prop()
  userId?: string;
}

export const UrlShortenerSchema = SchemaFactory.createForClass(UrlShortener);
