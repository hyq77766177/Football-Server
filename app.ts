import { Application } from 'egg'
import dotenv from 'dotenv'

export default class AppBootHook {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  public configWillLoad() {
    const result = dotenv.config()
    if (result.error) {
      this.app.logger.error('Config ".env" error:\n', result.error)
      return
    }
    this.app.logger.debug('.env loaded:\n', result.parsed)
    const {
      REDIS_HOST,
      REDIS_PORT,
      REDIS_PASSWORD,
      REDIS_DB,
      MONGO_DB,
      MONGO_PASSWORD,
      MONGO_USER,
      MONGO_HOST,
      MONGO_PORT,
      SIGN_KEY,
    } = result.parsed!
    const { redis, mongoose } = this.app.config
    this.app.config.keys = SIGN_KEY || 'test_sign_key'
    redis.client = {
      host: REDIS_HOST || 'localhost',
      port: (REDIS_PORT && +REDIS_PORT) || 6379,
      password: REDIS_PASSWORD,
      db: (REDIS_DB && +REDIS_DB) || 0,
    }
    if (this.app.config.env === 'unittest') {
      redis.client = {
        host: 'localhost',
        port: 6379,
        db: 0,
      }
      return
    }
    mongoose.client &&
      (mongoose.client.url = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`)
  }
}
