import * as fs from 'fs';

export function buildSslOptions(): object | false {
  if (process.env.DB_SSL !== 'true') {
    return false;
  }
  return {
    cert: fs.readFileSync(process.env.DB_CA_CERTIFICATE_PATH),
    key: fs.readFileSync(process.env.DB_KEY_PATH),
    rejectUnauthorized: false,
  };
}
