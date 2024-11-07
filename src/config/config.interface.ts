export interface IAppConfig {
  port: number;
  jwtSecret: string;
  publicToken: string;
  database: {
    uri: string;
  };
  cache: {
    store: string;
    ttl: number;
    redis: {
      host: string;
      port: number;
      password: string;
    };
  };
  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
  };
}
