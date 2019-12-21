import { Controller } from 'egg'

export default class Account extends Controller {
  public async login() {
    this.ctx.validate(
      {
        code: { type: 'string', required: true },
        identity: {
          type: 'object',
          required: true,
          rule: {
            signature: 'string',
            rawData: 'string',
          },
        },
        userInfo: {
          type: 'object',
          required: true,
          rule: {
            avatarUrl: 'string',
            city: 'string',
            country: 'string',
            gender: 'number',
            language: 'string',
            nickName: 'string',
            province: 'string',
          },
        },
      },
      this.ctx.body
    )

    const result = await this.ctx.service.account.login(this.ctx.request.body)
    this.ctx.body = this.ctx.helper.responseFormat(result)
  }
}
