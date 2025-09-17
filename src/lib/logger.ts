// ✅ SYSTÈME DE LOGGING OPTIMISÉ
const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
    // En production, envoyer à un service de monitoring
    if (!isDevelopment) {
      // TODO: Intégrer Sentry ou autre service
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

// Remplacer console par logger dans tout le projet
export const replaceConsole = () => {
  if (!isDevelopment) {
    // @ts-ignore
    window.console = {
      log: () => {},
      error: logger.error,
      warn: () => {},
      debug: () => {},
      info: () => {},
      trace: () => {},
      table: () => {},
      group: () => {},
      groupEnd: () => {},
      time: () => {},
      timeEnd: () => {},
      count: () => {},
      clear: () => {}
    };
  }
};
