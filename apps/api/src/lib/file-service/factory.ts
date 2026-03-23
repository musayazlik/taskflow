/**
 * @fileoverview Registry and selector for `FileService` implementations.
 * @module @api/lib/file-service/factory
 */

import { FileProvider, FileService } from "./interface";
import { UploadThingProvider } from "./providers/uploadthing.provider";

/**
 * Static registry of storage providers. Initialized via {@link initialize} from API bootstrap.
 */
export class FileServiceFactory {
  private static providers: Map<FileProvider, FileService> = new Map();

  /**
   * Registers a provider instance (normally called from {@link initialize}).
   */
  static registerProvider(provider: FileService): void {
    this.providers.set(provider.provider, provider);
  }

  /**
   * @param type - Registered provider enum.
   * @throws If no provider registered for `type`.
   */
  static getProvider(type: FileProvider): FileService {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Provider ${type} not registered`);
    }
    return provider;
  }

  /** @returns All registered instances (configured or not). */
  static getAllProviders(): FileService[] {
    return Array.from(this.providers.values());
  }

  /** Providers where `isConfigured()` is true. */
  static getConfiguredProviders(): FileService[] {
    return this.getAllProviders().filter((p) => p.isConfigured());
  }

  /** Whether `type` is registered and configured. */
  static isProviderAvailable(type: FileProvider): boolean {
    const provider = this.providers.get(type);
    return provider?.isConfigured() ?? false;
  }

  /**
   * Picks a default backend: `preferredProvider` if configured, else first configured, else `null`.
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
   * Chooses provider for a MIME type: honors `preferredProvider`, then UploadThing when available.
   *
   * @throws When no provider is configured at all.
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
   * Registers built-in providers (UploadThing). Call once from API bootstrap after
   * `refreshUploadthingTokenCache` from `@api/lib/uploadthing` so DB-backed tokens apply.
   */
  static initialize(): void {
    this.registerProvider(new UploadThingProvider());
  }
}
