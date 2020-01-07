import { EggAppConfig, PowerPartial } from 'egg'

export default () => {
  const config = {} as PowerPartial<EggAppConfig>

  config.mongoose = {
    client: {
      url: `mongodb://test:test@localhost:27017/football`,
      options: {
        useNewUrlParser: true,
        useFindAndModify: false,
      },
    },
  }

  config.redis = {
    client: {
      host: 'localhost',
      port: 6379,
      password: 'test',
      db: 0,
    },
  }

  config.keys = 'test_sign_key'

  return config
}
