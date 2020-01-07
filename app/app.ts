import { Application } from 'egg'

export default (app: Application) => {
  app.sessionStore = {
    async get(key) {
      const res = await app.redis.get(key)
      if (!res) {
        return null
      }
      return JSON.parse(res)
    },

    async set(key, val, maxAge = 2 * 60 * 60 * 1000) {
      val = JSON.stringify(val)
      await app.redis.set(key, val, 'PX', maxAge)
    },

    async destroy(key) {
      await app.redis.del(key)
    },
  }
}
