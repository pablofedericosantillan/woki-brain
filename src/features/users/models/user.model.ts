import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'crypto';

export const COLLECTION_NAME = 'users';

export type UserDocument = HydratedDocument<User>;

@Schema({
  collection: COLLECTION_NAME,
  timestamps: true,
})
export class User {
  @Prop({ required: true, default: () => randomUUID() })
  _id: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  pwd: string;

  @Prop({ required: false, type: Object, default: {} })
  metadata?: Record<string, unknown>;

  @Prop({ required: false, default: Date.now })
  createdAt: Date;

  @Prop({ required: false, default: Date.now })
  updatedAt: Date;

  @Prop({ required: false, default: undefined })
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });
