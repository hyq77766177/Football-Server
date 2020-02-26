import { EggPlugin } from 'egg'

const plugin: EggPlugin = {
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  },

  validate: {
    enable: true,
    package: 'egg-validate',
  },

  redis: {
    enable: true,
    package: 'egg-redis',
  },

  sessionRedis: {
    enable: true,
    package: 'egg-session-redis',
  },

  cors: {
    enable: true,
    package: 'egg-cors',
  },

  nunjucks: {
    enable: true,
    package: 'egg-view-nunjucks',
  },
}

export default plugin
