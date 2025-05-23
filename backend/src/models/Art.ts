import mongoose, { Schema, Document } from 'mongoose';

export interface IComment {
  _id?: mongoose.Types.ObjectId; // Using Types.ObjectId instead of Schema.Types.ObjectId
  text: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

export interface IArt extends Document {
  title: string;
  prompt: string;
  imageUrl: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  likes: mongoose.Schema.Types.ObjectId[];
  likesCount: number;
  comments: IComment[];
  commentsCount: number;
  views: number;
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
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    likesCount: {
      type: Number,
      default: 0
    },
    comments: [{
      text: {
        type: String,
        required: true
      },
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    commentsCount: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IArt>('Art', ArtSchema);
