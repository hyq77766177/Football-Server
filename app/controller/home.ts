import { Controller } from 'egg'

export default class HomeController extends Controller {
  public async index() {
    const { ctx } = this
    const homeData = await ctx.service.home.index()
    await ctx.render('home.tpl', homeData)
  }
}
