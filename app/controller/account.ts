import { Controller } from 'egg'

export default class Account extends Controller {
  public async login() {
    this.ctx.validate(
      {
        code: { type: 'string', required: true },
      },
      this.ctx.query
    )
    const result = await this.ctx.service.account.getWeixinSession()
    this.ctx.body = this.ctx.helper.responseFormat(result)
  }
}
