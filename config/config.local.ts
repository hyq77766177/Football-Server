import { EggAppConfig, PowerPartial } from 'egg'

export default () => {
  const config: PowerPartial<EggAppConfig> = {}
  config.logger = {
    consoleLevel: 'DEBUG',
  }
  return config
}
