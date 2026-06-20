export type BrowserType = 'chrome' | 'brave' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown';

export interface BrowserInfo {
  type: BrowserType;
  name: string;
  supportsWebSpeech: boolean;
}

/**
 * Detecta o navegador atual do usuário
 * @returns Informações sobre o navegador
 */
interface NavigatorBrave extends Navigator {
  brave?: { isBrave: () => Promise<boolean> };
}

export const detectBrowser = (): BrowserInfo => {
  const userAgent = navigator.userAgent.toLowerCase();
  const nav = navigator as NavigatorBrave;

  // Brave - detectar pela presença da API navigator.brave
  if (nav.brave && typeof nav.brave.isBrave === 'function') {
    return {
      type: 'brave',
      name: 'Brave',
      supportsWebSpeech: true, // Tecnicamente suporta, mas pode estar bloqueado por privacidade
    };
  }

  // Edge (Chromium-based)
  if (userAgent.includes('edg/') || userAgent.includes('edge/')) {
    return {
      type: 'edge',
      name: 'Microsoft Edge',
      supportsWebSpeech: true,
    };
  }

  // Opera
  if (userAgent.includes('opr/') || userAgent.includes('opera')) {
    return {
      type: 'opera',
      name: 'Opera',
      supportsWebSpeech: true,
    };
  }

  // Chrome
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
    return {
      type: 'chrome',
      name: 'Google Chrome',
      supportsWebSpeech: true,
    };
  }

  // Safari
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return {
      type: 'safari',
      name: 'Safari',
      supportsWebSpeech: false, // Safari não suporta Web Speech API
    };
  }

  // Firefox
  if (userAgent.includes('firefox')) {
    return {
      type: 'firefox',
      name: 'Firefox',
      supportsWebSpeech: false, // Firefox não suporta Web Speech API
    };
  }

  // Navegador desconhecido
  return {
    type: 'unknown',
    name: 'Unknown Browser',
    supportsWebSpeech: false,
  };
};

/**
 * Obtém mensagem de erro específica para o navegador
 * @param browserType Tipo do navegador
 * @param lang Idioma atual (pt, en, es)
 * @returns Mensagem de erro personalizada
 */
export const getBrowserSpecificMessage = (
  browserType: BrowserType,
  lang: string = 'pt'
): string => {
  const messages = {
    brave: {
      pt: '⚠️ Brave detectado. Para usar busca por voz, desative os Shields (🛡️) temporariamente ou ative os serviços do Google nas configurações de privacidade.',
      en: '⚠️ Brave detected. To use voice search, temporarily disable Shields (🛡️) or enable Google services in privacy settings.',
      es: '⚠️ Brave detectado. Para usar búsqueda por voz, desactive temporalmente los Shields (🛡️) o active los servicios de Google en la configuración de privacidad.',
    },
    firefox: {
      pt: '❌ Firefox não suporta busca por voz. Use Chrome, Edge ou Brave para esta funcionalidade.',
      en: '❌ Firefox does not support voice search. Use Chrome, Edge, or Brave for this feature.',
      es: '❌ Firefox no admite búsqueda por voz. Usa Chrome, Edge o Brave para esta función.',
    },
    safari: {
      pt: '❌ Safari não suporta busca por voz. Use Chrome, Edge ou Brave para esta funcionalidade.',
      en: '❌ Safari does not support voice search. Use Chrome, Edge, or Brave for this feature.',
      es: '❌ Safari no admite búsqueda por voz. Usa Chrome, Edge o Brave para esta función.',
    },
    unknown: {
      pt: '⚠️ Navegador não reconhecido. Busca por voz pode não funcionar. Recomendamos Chrome ou Edge.',
      en: '⚠️ Unrecognized browser. Voice search may not work. We recommend Chrome or Edge.',
      es: '⚠️ Navegador no reconocido. La búsqueda por voz puede no funcionar. Recomendamos Chrome o Edge.',
    },
  };

  const browserMessages = messages[browserType as keyof typeof messages];
  if (browserMessages) {
    return browserMessages[lang as keyof typeof browserMessages] || browserMessages.pt;
  }

  return '';
};
