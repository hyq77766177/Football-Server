import { Context, Application } from 'egg'

const authentication = (_, app: Application) => async (ctx: Context, next: () => Promise<any>) => {
  ctx.logger.info('path', ctx.request.path)
  if (/(^\/api\/login)|(^\/$)/.test(ctx.request.path)) {
    await next()
    return
  }
  if (ctx.session && ctx.session.openid) {
    const user = await ctx.model.Referee.findOne({ openid: ctx.session.openid })
    ctx.logger.info('User Query', user)
    if (!user) {
      ctx.bizErrorCode = ctx.helper.errCode.NO_USER
      return
    }
    ctx.user = user
    await next()
    return
  } else if (app.config.env === 'local') {
    await next()
    return
  }
  ctx.bizErrorCode = ctx.helper.errCode.NOT_SIGNIN
  await next()
}

export default authentication
