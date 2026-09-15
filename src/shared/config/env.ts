import Constants from 'expo-constants';

const ENV = {
  development: {
    API_URL: 'http://localhost:3000/api',
    ENV_NAME: 'development' as const,
  },
  preview: {
    API_URL: 'https://preview-api.mola.app/api',
    ENV_NAME: 'preview' as const,
  },
  production: {
    API_URL: 'https://api.mola.app/api',
    ENV_NAME: 'production' as const,
  },
};

const currentEnv = Constants.expoConfig?.extra?.env || 'development';

export const config = {
  ...ENV[currentEnv as keyof typeof ENV],
  isDevelopment: currentEnv === 'development',
  isPreview: currentEnv === 'preview',
  isProduction: currentEnv === 'production',
} as const;
