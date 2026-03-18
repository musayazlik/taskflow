/**
 * File Upload Service Factory
 * Provides runtime provider selection and dependency injection support
 */

import { FileProvider, FileService } from "./interface";
import { UploadThingProvider } from "./providers/uploadthing.provider";

export class FileServiceFactory {
  private static providers: Map<FileProvider, FileService> = new Map();

  /**
   * Register a provider instance
   */
  static registerProvider(provider: FileService): void {
    this.providers.set(provider.provider, provider);
  }

  /**
   * Get a provider by type
   */
  static getProvider(type: FileProvider): FileService {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Provider ${type} not registered`);
    }
    return provider;
  }

  /**
   * Get all registered providers
   */
  static getAllProviders(): FileService[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get all configured (ready-to-use) providers
   */
  static getConfiguredProviders(): FileService[] {
    return this.getAllProviders().filter((p) => p.isConfigured());
  }

  /**
   * Check if a provider is available
   */
  static isProviderAvailable(type: FileProvider): boolean {
    const provider = this.providers.get(type);
    return provider?.isConfigured() ?? false;
  }

  /**
   * Get default provider based on configuration
   * Priority: 1. Explicit default, 2. First configured, 3. None
   */
  static getDefaultProvider(
    preferredProvider?: FileProvider
  ): FileService | null {
    // If preferred provider is specified and available, use it
    if (preferredProvider && this.isProviderAvailable(preferredProvider)) {
      return this.getProvider(preferredProvider);
    }

    // Otherwise, return first configured provider
    const configured = this.getConfiguredProviders();
    return configured.length > 0 ? configured[0]! : null;
  }

  /**
   * Select best provider for a file type
   * Images -> Cloudinary (better transformations)
   * Others -> UploadThing
   */
  static getProviderForFile(
    mimeType: string,
    preferredProvider?: FileProvider
  ): FileService {
    // Use preferred provider if specified
    if (preferredProvider && this.isProviderAvailable(preferredProvider)) {
      return this.getProvider(preferredProvider);
    }

    // Auto-select based on file type - UploadThing for all files
    if (this.isProviderAvailable(FileProvider.UPLOADTHING)) {
      return this.getProvider(FileProvider.UPLOADTHING);
    }

    // Fallback to any available provider
    const defaultProvider = this.getDefaultProvider();
    if (defaultProvider) {
      return defaultProvider;
    }

    throw new Error("No file storage provider is configured");
  }

  /**
   * Initialize all providers
   * Call this at application startup
   */
  static initialize(): void {
    // Register UploadThing
    const uploadThing = new UploadThingProvider();
    if (uploadThing.isConfigured()) {
      this.registerProvider(uploadThing);
    }
  }
}

// Initialize on module load
FileServiceFactory.initialize();
