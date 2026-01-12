//Environment Configuration Helper
// Provides type-safe access to environment variables
class EnvConfig {
  constructor() {
    this.validateRequiredVars();
  }

  // Required environment variables
  get openWeatherApiKey() {
    return import.meta.env.VITE_OPENWEATHER_API_KEY || '';
  }

  get coinGeckoApiUrl() {
    return import.meta.env.VITE_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
  }

  // Optional configuration
  get appName() {
    return import.meta.env.VITE_APP_NAME || 'Interactive Dashboard';
  }

  get maxFileSizeMB() {
    return Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 5;
  }

  get supportedFileTypes() {
    const types = import.meta.env.VITE_SUPPORTED_FILE_TYPES || 'csv,json,xlsx,xls';
    return types.split(',');
  }

  get enableAnalytics() {
    return import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
  }

  get enableErrorReporting() {
    return import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true';
  }

  // API Rate Limiting
  get apiRateLimitRequests() {
    return Number(import.meta.env.VITE_API_RATE_LIMIT_REQUESTS) || 10;
  }

  get apiRateLimitWindow() {
    return Number(import.meta.env.VITE_API_RATE_LIMIT_WINDOW) || 60000;
  }

  // Environment checks
  get isDevelopment() {
    return import.meta.env.DEV;
  }

  get isProduction() {
    return import.meta.env.PROD;
  }

  get mode() {
    return import.meta.env.MODE;
  }

  /**
   * Validate that required environment variables are set
   */
  validateRequiredVars() {
    const required = [
      { key: 'VITE_OPENWEATHER_API_KEY', value: this.openWeatherApiKey }
    ];

    const missing = required.filter(({ value }) => !value);

    if (missing.length > 0 && this.isProduction) {
      console.error('Missing required environment variables:', 
        missing.map(({ key }) => key).join(', ')
      );
    }

    if (missing.length > 0 && this.isDevelopment) {
      console.warn('Missing environment variables:', 
        missing.map(({ key }) => key).join(', ')
      );
      console.warn('Copy .env.example to .env and fill in your API keys');
    }
  }

  /**
   * Get all config as object (useful for debugging)
   */
  getAll() {
    return {
      openWeatherApiKey: this.openWeatherApiKey ? '***' + this.openWeatherApiKey.slice(-4) : 'NOT_SET',
      coinGeckoApiUrl: this.coinGeckoApiUrl,
      appName: this.appName,
      maxFileSizeMB: this.maxFileSizeMB,
      supportedFileTypes: this.supportedFileTypes,
      enableAnalytics: this.enableAnalytics,
      enableErrorReporting: this.enableErrorReporting,
      apiRateLimitRequests: this.apiRateLimitRequests,
      apiRateLimitWindow: this.apiRateLimitWindow,
      isDevelopment: this.isDevelopment,
      isProduction: this.isProduction,
      mode: this.mode
    };
  }

  /**
   * Log configuration (safe for production - no secrets)
   */
  logConfig() {
    if (this.isDevelopment) {
      console.table(this.getAll());
    }
  }
}

// Export singleton instance
export const config = new EnvConfig();

// Also export class for testing
export { EnvConfig };