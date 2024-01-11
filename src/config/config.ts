import * as dotenv from 'dotenv';

dotenv.config();

const configs = () => ({
  database: {
    host: process.env.PG_DB_HOST,
    username: process.env.PG_DB_USERNAME,
    database: process.env.PG_DB_DATABASE,
    password: process.env.PG_DB_PASSWORD,
    autoLoadEntities: true,
  },
  eventConfig: {
    // set this to `true` to use wildcards
    wildcard: false,
    // the delimiter used to segment namespaces
    delimiter: '.',
    // set this to `true` if you want to emit the newListener event
    newListener: false,
    // set this to `true` if you want to emit the removeListener event
    removeListener: false,
    // the maximum amount of listeners that can be assigned to an event
    maxListeners: 10,
    // show event name in memory leak message when more than maximum amount of listeners is assigned
    verboseMemoryLeak: false,
    // disable throwing uncaughtException if an error event is emitted and it has no listeners
    ignoreErrors: false,
  },
});

export const isProd = () => process.env.NODE_ENV === 'production';

export const dbConfig = configs().database;

export default configs;
