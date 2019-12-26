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

  return config
}
