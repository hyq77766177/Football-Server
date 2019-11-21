import { Context } from 'egg'
import _ from 'lodash'

const authentication = () => async (ctx: Context, next: () => Promise<any>) => {
  if (/(^\/api\/login)/.test(ctx.request.path)) {
    await next()
    return
  }
  if (ctx.session && ctx.session.openid) {
    const user = await ctx.model.Referee.findById(ctx.session.openid)
    ctx.logger.debug('User Query', user)
    if (!user) {
      ctx.bizErrorCode = ctx.helper.errCode.NO_USER
      return
    }
    ctx.user = user
    await next()
    return
  }
  ctx.bizErrorCode = ctx.helper.errCode.NOT_SIGNIN
}

export default authentication
