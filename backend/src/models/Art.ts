import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

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
    },    slug: {
      type: String,
      required: false, 
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

// Generate slug from title
ArtSchema.pre('save', async function(next) {
  console.log('🚨 Art pre-save hook called!');
  console.log('🚨 isNew:', this.isNew);
  console.log('🚨 isModified(title):', this.isModified('title'));
  console.log('🚨 Current title:', this.title);
  console.log('🚨 Current slug:', this.slug);
  
  // Always generate slug for new documents or when title is modified
  if (this.isNew || this.isModified('title')) {
    try {
      console.log('Generating slug for title:', this.title);
      // Generate base slug from title
      let baseSlug = slugify(this.title, { 
        lower: true,     // Convert to lowercase
        strict: true,    // Strip special chars
        trim: true       // Trim spaces
      });
      
      console.log('Base slug generated:', baseSlug);
      
      // If baseSlug is empty (all special chars), use a default
      if (!baseSlug) {
        baseSlug = 'art';
        console.log('Using default base slug:', baseSlug);
      }
      
      // Generate a unique slug with timestamp and random suffix
      const timestamp = Date.now().toString();
      const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      let slug = `${baseSlug}-${timestamp}-${randomSuffix}`;
      
      console.log('Generated slug before uniqueness check:', slug);
      
      // Ensure slug is unique (check for duplicates)
      let counter = 0;
      let originalSlug = slug;
      while (await mongoose.model('Art').findOne({ slug: slug })) {
        counter++;
        slug = `${originalSlug}-${counter}`;
        console.log('Slug collision detected, trying:', slug);
      }
      
      console.log('Final slug assigned:', slug);
      this.slug = slug;
    } catch (error) {
      console.error('Error in pre-save hook:', error);
      return next(error as Error);
    }
  }
  
  // Ensure slug is always present before saving
  if (!this.slug) {
    const error = new Error('Slug generation failed - slug is required');
    console.error('🚨 Slug validation failed:', error.message);
    return next(error);
  }
  
  console.log('🚨 Pre-save hook completed successfully, slug:', this.slug);
  next();
});

export default mongoose.model<IArt>('Art', ArtSchema);
