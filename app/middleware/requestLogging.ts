import chalk from 'chalk'
import { Context } from 'egg'
import _ from 'lodash'

const requestLogging = () => async (ctx: Context, next: () => Promise<any>) => {
  const headerStr = _.entries(ctx.header)
    .map(item => `\n  - ${item[0]}: ${item[1]}`)
    .join('')
  ctx.logger.info(headerStr)
  ctx.logger.debug(chalk.magenta('Request body\n'), ctx.request.body)
  ctx.logger.debug(chalk.magenta('Request query\n'), ctx.request.query)
  await next()
  ctx.logger.debug(chalk.greenBright('Response body\n'), ctx.body)
}

export default requestLogging
