import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

/**
 * Image Optimization Service
 * Converts images to WebP, generates multiple sizes, reduces bandwidth
 */

export interface ImageSizes {
  thumbnail: { width: number; height: number };
  medium: { width: number; height: number };
  large: { width: number; height: number };
  full: { width: number; height: number };
}

export const DEFAULT_SIZES: ImageSizes = {
  thumbnail: { width: 150, height: 150 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 },
  full: { width: 2400, height: 2400 },
};

export interface OptimizedImage {
  thumbnail: string;
  medium: string;
  large: string;
  full: string;
  original: string;
}

class ImageOptimizerService {
  /**
   * Optimize single image and generate multiple sizes
   */
  async optimizeImage(
    inputPath: string,
    outputDir: string,
    baseName: string,
    sizes: ImageSizes = DEFAULT_SIZES
  ): Promise<OptimizedImage> {
    try {
      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });

      const results: OptimizedImage = {
        thumbnail: '',
        medium: '',
        large: '',
        full: '',
        original: inputPath,
      };

      // Load image
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      // Generate thumbnail
      const thumbnailPath = path.join(outputDir, `${baseName}-thumbnail.webp`);
      await image
        .clone()
        .resize(sizes.thumbnail.width, sizes.thumbnail.height, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 80 })
        .toFile(thumbnailPath);
      results.thumbnail = thumbnailPath;

      // Generate medium
      const mediumPath = path.join(outputDir, `${baseName}-medium.webp`);
      await image
        .clone()
        .resize(sizes.medium.width, sizes.medium.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toFile(mediumPath);
      results.medium = mediumPath;

      // Generate large
      const largePath = path.join(outputDir, `${baseName}-large.webp`);
      await image
        .clone()
        .resize(sizes.large.width, sizes.large.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 90 })
        .toFile(largePath);
      results.large = largePath;

      // Generate full (optimized original)
      const fullPath = path.join(outputDir, `${baseName}-full.webp`);
      await image
        .clone()
        .resize(sizes.full.width, sizes.full.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 92 })
        .toFile(fullPath);
      results.full = fullPath;

      return results;
    } catch (error) {
      console.error('Image optimization error:', error);
      throw error;
    }
  }

  /**
   * Convert image to WebP format
   */
  async convertToWebP(
    inputPath: string,
    outputPath: string,
    quality: number = 85
  ): Promise<string> {
    try {
      await sharp(inputPath)
        .webp({ quality })
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('WebP conversion error:', error);
      throw error;
    }
  }

  /**
   * Resize image to specific dimensions
   */
  async resizeImage(
    inputPath: string,
    outputPath: string,
    width: number,
    height: number,
    fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside' = 'inside'
  ): Promise<string> {
    try {
      await sharp(inputPath)
        .resize(width, height, { fit })
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('Image resize error:', error);
      throw error;
    }
  }

  /**
   * Compress image without resizing
   */
  async compressImage(
    inputPath: string,
    outputPath: string,
    quality: number = 80
  ): Promise<string> {
    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      // Choose compression based on format
      if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
        await image.jpeg({ quality }).toFile(outputPath);
      } else if (metadata.format === 'png') {
        await image.png({ quality }).toFile(outputPath);
      } else if (metadata.format === 'webp') {
        await image.webp({ quality }).toFile(outputPath);
      } else {
        // Convert to WebP for other formats
        await image.webp({ quality }).toFile(outputPath);
      }

      return outputPath;
    } catch (error) {
      console.error('Image compression error:', error);
      throw error;
    }
  }

  /**
   * Get image metadata
   */
  async getMetadata(imagePath: string) {
    try {
      const metadata = await sharp(imagePath).metadata();
      return metadata;
    } catch (error) {
      console.error('Get metadata error:', error);
      throw error;
    }
  }

  /**
   * Generate image from buffer
   */
  async processBuffer(
    buffer: Buffer,
    outputPath: string,
    width?: number,
    height?: number
  ): Promise<string> {
    try {
      let image = sharp(buffer);

      if (width && height) {
        image = image.resize(width, height, { fit: 'inside' });
      }

      await image.webp({ quality: 85 }).toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('Process buffer error:', error);
      throw error;
    }
  }

  /**
   * Batch optimize multiple images
   */
  async batchOptimize(
    inputPaths: string[],
    outputDir: string,
    sizes: ImageSizes = DEFAULT_SIZES
  ): Promise<OptimizedImage[]> {
    const results: OptimizedImage[] = [];

    for (const inputPath of inputPaths) {
      try {
        const baseName = path.basename(inputPath, path.extname(inputPath));
        const optimized = await this.optimizeImage(
          inputPath,
          outputDir,
          baseName,
          sizes
        );
        results.push(optimized);
      } catch (error) {
        console.error(`Failed to optimize ${inputPath}:`, error);
      }
    }

    return results;
  }

  /**
   * Create responsive image srcset
   */
  async createResponsiveSrcSet(
    inputPath: string,
    outputDir: string,
    baseName: string
  ): Promise<{ srcset: string; sizes: string }> {
    const widths = [320, 640, 960, 1280, 1920];
    const paths: string[] = [];

    for (const width of widths) {
      const outputPath = path.join(outputDir, `${baseName}-${width}w.webp`);
      await sharp(inputPath)
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(outputPath);
      
      paths.push(`${outputPath} ${width}w`);
    }

    return {
      srcset: paths.join(', '),
      sizes: '(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 960px) 960px, (max-width: 1280px) 1280px, 1920px',
    };
  }
}

// Export singleton instance
export const imageOptimizerService = new ImageOptimizerService();
