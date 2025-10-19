// lib/config.ts
// Централизованная конфигурация для production домена

export const PRODUCTION_DOMAIN = 'https://www.vibekip.com';

export function getBaseUrl(): string {
  // В production всегда используем www.vibekip.com
  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_DOMAIN;
  }
  
  // В development используем localhost
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback для SSR
  return process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_DOMAIN;
}

export function getApiUrl(): string {
  return `${getBaseUrl()}/api`;
}

export function getOverlayUrl(key: string, params?: Record<string, string>): string {
  const url = new URL(`${getBaseUrl()}/overlay`);
  url.searchParams.set('key', key);
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      url.searchParams.set(k, v);
    });
  }
  
  return url.toString();
}

export function getPanelUrl(): string {
  return `${getBaseUrl()}/panel`;
}

export function getSignInUrl(): string {
  return `${getBaseUrl()}/sign-in`;
}

export function getSignUpUrl(): string {
  return `${getBaseUrl()}/sign-up`;
}

export function getPremiumUrl(): string {
  return `${getBaseUrl()}/premium`;
}

// Проверка, что мы используем production домен
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' && 
         (process.env.NEXT_PUBLIC_SITE_URL === PRODUCTION_DOMAIN || 
          process.env.VERCEL_URL?.includes('vibekip.com'));
}

// Проверка, что все URL используют правильный домен
export function validateUrls(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const baseUrl = getBaseUrl();
  
  if (process.env.NODE_ENV === 'production') {
    if (!baseUrl.includes('vibekip.com')) {
      errors.push(`Production base URL should be www.vibekip.com, got: ${baseUrl}`);
    }
    
    if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('vibekip.com')) {
      errors.push(`NEXT_PUBLIC_SITE_URL should be www.vibekip.com, got: ${process.env.NEXT_PUBLIC_SITE_URL}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
