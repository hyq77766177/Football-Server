import { Context, Application } from 'egg'

const authentication = (_, app: Application) => async (ctx: Context, next: () => Promise<any>) => {
  if (/(^\/api\/login)|(^\/$)/.test(ctx.request.path)) {
    await next()
    return
  }
  if (ctx.session && ctx.session.openid) {
    const user = await ctx.model.Referee.findOne({ openid: ctx.session.openid })
    ctx.logger.debug('User Query', user)
    if (!user) {
      throw new ctx.helper.CustomError(ctx.helper.errCode.NO_USER)
    }
    ctx.user = user
    await next()
    return
  } else if (app.config.env === 'local' || app.config.env === 'unittest') {
    // FIXME: mock data
    const user = await ctx.model.Referee.findOne({})
    if (!user) {
      throw new ctx.helper.CustomError(ctx.helper.errCode.NO_USER)
    }
    ctx.user = user
    await next()
    return
  }
  throw new ctx.helper.CustomError(ctx.helper.errCode.NOT_SIGNIN)
}

export default authentication
