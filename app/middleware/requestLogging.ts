import chalk from 'chalk'
import { Context } from 'egg'
import _ from 'lodash'

const requestLogging = () => async (ctx: Context, next: () => Promise<any>) => {
  const headerStr = _.entries(ctx.header)
    .map(item => `\n  - ${item[0]}: ${item[1]}`)
    .join('')
  ctx.logger.info(chalk.cyan(`\nIncoming reqeust header`), `${headerStr}`)
  ctx.logger.debug(chalk.magenta('\nRequest body'), ctx.request.body)
  await next()
  ctx.logger.debug(chalk.greenBright('\nResponse body'), ctx.body)
}

export default requestLogging
