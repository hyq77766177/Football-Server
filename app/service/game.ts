import { Service } from 'egg'
import { filter, some, xorWith, isEqual } from 'lodash'

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
    // const { _id } = this.ctx.request.query
    const games = await this.ctx.model.Game.find().populate('referees')
    const openid = this.ctx.session?.openid
    const { id } = this.ctx.user
    this.ctx.logger.debug('openid', openid)
    if (!openid) {
      return {
        availableGames: games,
        myEnroledGames: [],
        myCreatedGames: [],
      }
    }
    const myCreatedGames = filter(games, game => game.publisher.id === id)
    const myEnroledGames = filter(games, game =>
      some(game.referees, referee => referee.openid === openid)
    )
    const availableGames = xorWith(xorWith(games, myCreatedGames, isEqual), myEnroledGames, isEqual)
    return {
      myCreatedGames,
      myEnroledGames,
      availableGames,
    }
  }

  public async getGameById() {
    const { gameId } = this.ctx.request.query
    const game = await this.ctx.model.Game.findById(gameId)
    return game
  }

  public async create() {
    const {
      gameName,
      gameStartTime,
      gameEndTime,
      gameAvailablePeriod,
      requiredRefereeAmount,
      avatar,
    } = this.ctx.request.body
    await this.ctx.model.Game.create({
      gameName,
      gameStartTime,
      gameEndTime,
      gameAvailablePeriod,
      requiredRefereeAmount,
      publisher: {
        avatar,
        id: this.ctx.user._id,
      },
    })
    return '创建成功'
  }

  public async deleteGameById() {
    const { gameId } = this.ctx.request.body
    const game = await this.ctx.model.Game.findById(gameId)
    if (!game) {
      this.ctx.bizErrorCode = this.ctx.helper.errCode.INVALID_PARAM
      return
    }
    if (game.publisher.id !== this.ctx.user._id) {
      this.ctx.bizErrorCode = this.ctx.helper.errCode.CANNOT_DELETE_GAME_CREATED_BY_OTHER
      return
    }
    await this.ctx.model.Game.findByIdAndDelete(gameId)
    return '删除成功'
  }
}
