import { EggAppConfig, PowerPartial } from 'egg'

export default () => {
  const config: PowerPartial<EggAppConfig> = {}

  config.cluster = {
    listen: {
      hostname: '0.0.0.0',
    },
  }

  config.logger = {
    consoleLevel: 'DEBUG',
  }
  return config
}
