import mongoose, { Schema, Document } from 'mongoose';

export interface IComment {
  _id?: mongoose.Types.ObjectId; // Using Types.ObjectId instead of Schema.Types.ObjectId
  text: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

export interface IArt extends Document {
  title: string;
  slug: string;
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
    slug: {
      type: String,
      required: true,
      unique: true,
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
  },  {
    timestamps: true,
  }
);

// Import and use slugify to generate slug from title
import slugify from 'slugify';

// Generate slug from title
ArtSchema.pre('save', function(next) {
  // Only generate slug if title has been modified or it's a new document
  if (this.isModified('title') || this.isNew) {
    // Generate base slug from title
    let baseSlug = slugify(this.title, { 
      lower: true,     // Convert to lowercase
      strict: true,    // Strip special chars
      trim: true       // Trim spaces
    });
    
    // Add a random suffix to make slug unique
    const randomSuffix = Math.floor(Math.random() * 10000).toString();
    this.slug = `${baseSlug}-${randomSuffix}`;
  }
  next();
});

export default mongoose.model<IArt>('Art', ArtSchema);
