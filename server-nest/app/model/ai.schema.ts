import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AiDocument = Ai & Document;

@Schema()
export class Ai {
    @ApiProperty()
    @Prop({ required: true })
    aiName: string;

    @ApiProperty()
    @Prop({ required: true })
    isDefault: boolean;

    @ApiProperty()
    @Prop()
    _id?: string;
}

export const AI_SCHEMA = SchemaFactory.createForClass(Ai);
