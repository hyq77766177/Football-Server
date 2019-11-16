import { Service } from 'egg'

/**
 * Game Service
 * @export
 * @class Game
 * @extends {Service}
 */
export default class Game extends Service {
  /**
   * Get game list from db
   */
  public async getAll() {
    const games = await this.ctx.model.Game.find()
    return games
  }

  public async create() {
    const {
      gameName,
      gameDate,
      gameTime,
      gameEndTime,
      requiredRefereeAmount,
      publisher,
    } = this.ctx.request.body
    await this.ctx.model.Game.create({
      gameName,
      gameDate,
      gameTime,
      gameEndTime,
      requiredRefereeAmount,
      publisher,
    })
  }
}
