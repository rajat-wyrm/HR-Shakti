export const config = {
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem',
    publicKey: process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem',
    accessExpiration: parseInt(process.env.JWT_ACCESS_EXPIRATION || '900'),
    refreshExpiration: parseInt(process.env.JWT_REFRESH_EXPIRATION || '604800'),
    issuer: process.env.JWT_ISSUER || 'hrshakti',
  },
  argon2: {
    memory: parseInt(process.env.ARGON2_MEMORY || '65536'),
    iterations: parseInt(process.env.ARGON2_ITERATIONS || '3'),
    parallelism: parseInt(process.env.ARGON2_PARALLELISM || '4'),
  },
};
