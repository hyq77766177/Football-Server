import { Context } from 'egg'
import { isEmpty } from 'lodash'

const authentication = () => async (ctx: Context, next: () => Promise<any>) => {
  ctx.logger.debug('User ID', ctx.session?.id)
  if (ctx.session?.id) {
    const user = await ctx.model.Referee.findById(ctx.session?.id)
    ctx.logger.debug('User Query', user)
    if (isEmpty(user)) {
      throw new ctx.helper.CustomError(ctx.helper.errCode.NO_USER)
    }
    ctx.user = user!
    await next()
    return
  }
  throw new ctx.helper.HttpError(ctx.helper.errCode.UNAUTHORIZED)
}

export default authentication
