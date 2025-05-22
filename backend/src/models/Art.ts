import mongoose, { Schema, Document } from 'mongoose';

export interface IArt extends Document {
  title: string;
  prompt: string;
  imageUrl: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const ArtSchema = new Schema<IArt>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IArt>('Art', ArtSchema);
