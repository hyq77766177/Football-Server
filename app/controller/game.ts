import { Controller } from 'egg'

export default class Game extends Controller {
  /**
   * 返回比赛数据
   *
   * @query gameId - string
   *    如果不传取全部比赛, 否则取指定Id比赛; 查询不到为`null`
   * @memberof Game
   */
  public async getGame() {
    const { gameId } = this.ctx.request.query
    if (gameId) {
      const game = await this.service.game.getGameById()
      this.ctx.body = this.ctx.helper.responseFormat(game)
      return
    }
    const games = await this.service.game.getAll()
    this.ctx.body = this.ctx.helper.responseFormat(games)
  }

  public async createGame() {
    const rules = {
      gameName: { type: 'string', required: true },
      gameStartTime: { type: 'number', required: true },
      gameEndTime: { type: 'number', required: true },
      gameAvailablePeriod: { type: 'array', required: true, itemType: 'string' },
      requiredRefereeAmount: { type: 'number', required: true },
      avatar: {
        type: 'string',
        required: true,
      },
    }
    this.ctx.validate(rules, this.ctx.request.body)
    const result = await this.ctx.service.game.create()
    this.ctx.status = this.ctx.HTTP_STATUS_CODES.CREATED
    this.ctx.body = this.ctx.helper.responseFormat(result)
  }

  public async deleteGame() {
    this.ctx.validate({ gameId: { type: 'string', required: true } }, this.ctx.request.body)
    const result = await this.ctx.service.game.deleteGameById()
    this.ctx.body = this.ctx.helper.responseFormat(result)
  }

  public async enrolGame() {
    const rules = {
      gameId: { type: 'string', required: true },
      availablePeriod: { type: 'array', itemType: 'string', default: [] },
      refereeName: { type: 'string', required: true },
    }
    this.ctx.validate(rules, this.ctx.request.body)
    const result = await this.ctx.service.enrol.enrolGame(false)
    this.ctx.body = this.ctx.helper.responseFormat(result)
  }

  public async updateEnrol() {
    const rules = {
      gameId: { type: 'string', required: true },
      availablePeriod: { type: 'array', itemType: 'string', default: [] },
      refereeName: { type: 'string', required: true },
    }
    this.ctx.validate(rules, this.ctx.request.body)
    const result = await this.ctx.service.enrol.enrolGame(true)
    this.ctx.body = this.ctx.helper.responseFormat(result)
  }

  public async cancelEnrol() {
    this.ctx.validate({ gameId: { type: 'string', required: true } }, this.ctx.request.body)
    const result = await this.ctx.service.enrol.cancelEnrol()
    this.ctx.body = this.ctx.helper.responseFormat(result)
  }
}
