export default () => ({
  // Application
  app: {
    port: Number.parseInt(process.env.PORT!, 10),
    nodeEnv: process.env.NODE_ENV!,
  },

  // Database
  postgres: {
    host: process.env.POSTGRES_DB_HOST!,
    port: Number.parseInt(process.env.POSTGRES_DB_PORT!, 10),
    database: process.env.POSTGRES_DB_NAME!,
    username: process.env.POSTGRES_DB_USER!,
    password: process.env.POSTGRES_DB_PASSWORD!,
    ssl: process.env.POSTGRES_DB_SSL!,
  },
});
