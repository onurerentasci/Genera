import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  text: string;
  artId: mongoose.Schema.Types.ObjectId;
  createdBy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
    },
    artId: {
      type: Schema.Types.ObjectId,
      ref: 'Art',
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

// Indexes for better query performance
CommentSchema.index({ artId: 1, createdAt: -1 }); // Comments for specific art
CommentSchema.index({ createdBy: 1, createdAt: -1 }); // User's comments

export default mongoose.model<IComment>('Comment', CommentSchema);
