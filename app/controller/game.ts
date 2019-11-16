import { Controller } from 'egg'

export default class Game extends Controller {
  public async getGames() {
    const games = await this.service.game.getAll()
    this.ctx.body = this.ctx.helper.responseFormat(games)
  }

  public async createGame() {
    const rules = {
      gameName: { type: 'string', required: true },
      gameDate: { type: 'string', required: true },
      gameTime: { type: 'string', required: true },
      gameEndTime: { type: 'string', required: true },
      requiredRefereeAmount: { type: 'number', required: true },
      publisher: {
        type: 'object',
        required: true,
        rule: {
          openid: { type: 'string', required: true },
          avatar: 'string',
        },
      },
    }
    this.ctx.validate(rules, this.ctx.request.body)
    await this.ctx.service.game.create()
    this.ctx.status = this.ctx.HTTP_STATUS_CODES.CREATED
    this.ctx.body = this.ctx.helper.responseFormat('创建成功')
  }
}
