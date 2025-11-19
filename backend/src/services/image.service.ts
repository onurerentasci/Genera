import sharp from 'sharp';
import logger from '../utils/logger';

/**
 * Image Optimization Service
 * Handles image processing, optimization, and thumbnail generation
 */
export class ImageService {
  /**
   * Optimize image for web delivery
   * Converts to WebP format and resizes if needed
   */
  async optimizeImage(
    buffer: Buffer,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    } = {}
  ): Promise<Buffer> {
    try {
      const {
        maxWidth = 1024,
        maxHeight = 1024,
        quality = 85
      } = options;

      return await sharp(buffer)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality })
        .toBuffer();
    } catch (error) {
      logger.error('Error optimizing image', { error });
      throw error;
    }
  }

  /**
   * Generate thumbnail from image
   */
  async generateThumbnail(
    buffer: Buffer,
    options: {
      width?: number;
      height?: number;
      quality?: number;
    } = {}
  ): Promise<Buffer> {
    try {
      const {
        width = 300,
        height = 300,
        quality = 75
      } = options;

      return await sharp(buffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality })
        .toBuffer();
    } catch (error) {
      logger.error('Error generating thumbnail', { error });
      throw error;
    }
  }

  /**
   * Get image metadata
   */
  async getMetadata(buffer: Buffer) {
    try {
      return await sharp(buffer).metadata();
    } catch (error) {
      logger.error('Error getting image metadata', { error });
      throw error;
    }
  }

  /**
   * Convert image to specific format
   */
  async convertFormat(
    buffer: Buffer,
    format: 'jpeg' | 'png' | 'webp' | 'avif',
    quality = 85
  ): Promise<Buffer> {
    try {
      const sharpInstance = sharp(buffer);
      
      switch (format) {
        case 'jpeg':
          return await sharpInstance.jpeg({ quality }).toBuffer();
        case 'png':
          return await sharpInstance.png({ quality }).toBuffer();
        case 'webp':
          return await sharpInstance.webp({ quality }).toBuffer();
        case 'avif':
          return await sharpInstance.avif({ quality }).toBuffer();
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      logger.error('Error converting image format', { error, format });
      throw error;
    }
  }
}

// Export singleton instance
export const imageService = new ImageService();
