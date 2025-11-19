import { HfInference } from '@huggingface/inference';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import logger from '../utils/logger';
import { config } from '../config/env.config';

const writeFile = promisify(fs.writeFile);

export class HuggingFaceService {
  private hf: HfInference;

  constructor() {
    this.hf = new HfInference(config.HUGGINGFACE_TOKEN);
  }
  async generateImage(prompt: string, options?: {
    model?: string;
    width?: number;
    height?: number;
    num_inference_steps?: number;
    guidance_scale?: number;
  }): Promise<string> {
    const {
      model = 'black-forest-labs/FLUX.1-schnell',
      width = 512,
      height = 512,
      num_inference_steps = 20,
      guidance_scale = 7.5
    } = options || {};

    try {
      logger.debug('Generating image with model', { model });

      const imageBlob: any = await this.hf.textToImage({
        model,
        inputs: prompt,
      });
      
      // Convert blob to buffer
      let buffer: Buffer;
      if (imageBlob && typeof imageBlob === 'object' && 'arrayBuffer' in imageBlob && typeof imageBlob.arrayBuffer === 'function') {
        buffer = Buffer.from(await imageBlob.arrayBuffer());
      } else {
        // Handle case where imageBlob might be a different type
        buffer = Buffer.from(imageBlob);
      }
      
      // Create unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const filename = `generated-${timestamp}-${randomId}.png`;
      
      // Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const filePath = path.join(uploadsDir, filename);
      
      // Save image to file system
      await writeFile(filePath, buffer);
      
      logger.info('Image saved successfully', { filename });
      
      return filename;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Hugging Face API error', { error: errorMessage });
      
      // Check if it's a quota/rate limit error
      if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        throw new Error('AI service quota exceeded. Please try again later.');
      }
      
      // Check if it's a model loading error
      if (errorMessage.includes('loading') || errorMessage.includes('model')) {
        throw new Error('AI model is loading. Please try again in a few moments.');
      }
      
      throw new Error(`Image generation failed: ${errorMessage}`);
    }
  }

  // Alternative models for different styles
  async generateImageWithStyle(
    prompt: string, 
    style: 'realistic' | 'artistic' | 'anime' | 'abstract' = 'realistic'
  ): Promise<string> {
    const models = {
      realistic: 'black-forest-labs/FLUX.1-schnell',
      artistic: 'black-forest-labs/FLUX.1-schnell',
      anime: 'black-forest-labs/FLUX.1-schnell',
      abstract: 'black-forest-labs/FLUX.1-schnell'
    };

    const stylePrompts = {
      realistic: 'photorealistic, high detail, professional photography',
      artistic: 'artistic, painted, masterpiece, fine art',
      anime: 'anime style, manga, high quality anime art',
      abstract: 'abstract art, modern art, creative composition'
    };
    
    const enhancedPrompt = `${prompt}, ${stylePrompts[style]}`;
    
    return this.generateImage(enhancedPrompt, {
      model: models[style]
    });
  }
}

// Export the class, not an instance
export default HuggingFaceService;
