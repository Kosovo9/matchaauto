export const HYBRID_SYNC_CONFIG = {
  offline: {
    db: 'sqlite',
    storage: 'indexeddb',
    cache: 'redis-local',
  },
  online: {
    apiBase: 'https://tu-servidor.com/api',
    sensitiveEndpoints: ['/reports', '/escrow/balance'],
    leaderOnlyEndpoints: ['/reports/monthly', '/leaders/hubs'],
    syncInterval: 300_000,
  },
  privacy: {
    hideEarnings: true,
    encryptDataAtRest: true,
    encryptionKeyEnv: 'ENCRYPTION_KEY',
  },
};
