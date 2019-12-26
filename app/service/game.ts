import { Service } from 'egg'
import { filter, some, differenceWith, isEqual } from 'lodash'

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
    const games = await this.ctx.model.Game.find().populate('referees.referee')
    const openid = this.ctx.session?.openid
    const id = this.ctx.user?.id
    this.ctx.logger.debug('openid', openid)
    if (!openid || !id) {
      return {
        availableGames: games,
        myEnroledGames: [],
        myCreatedGames: [],
      }
    }
    const myCreatedGames = filter(games, game => game.publisher.id === id)
    const myEnroledGames = filter(games, game =>
      some(game.referees, referee => referee.referee.id === id)
    )
    const availableGames = differenceWith(games, myCreatedGames, myEnroledGames, isEqual)
    return {
      myCreatedGames,
      myEnroledGames,
      availableGames,
    }
  }

  public async getGameById(gameId: string) {
    const game = await this.ctx.model.Game.findById(gameId)
    return game
  }

  public async create(body: gameRequest.ICreateGame) {
    const {
      gameName,
      gameStartTime,
      gameEndTime,
      gameAvailablePeriod,
      requiredRefereeAmount,
      avatar,
    } = body
    const game = await this.ctx.model.Game.create({
      gameName,
      gameStartTime,
      gameEndTime,
      gameAvailablePeriod,
      requiredRefereeAmount,
      publisher: {
        avatar,
        id: this.ctx.user?._id,
      },
    })
    return {
      gameId: game.id,
    }
  }

  public async deleteGameById(gameId: string) {
    const game = await this.ctx.model.Game.findById(gameId)
    if (!game) {
      throw new this.ctx.helper.CustomError(this.ctx.helper.errCode.INVALID_PARAM)
    }
    if (game.publisher.id !== this.ctx.user?.id) {
      throw new this.ctx.helper.CustomError(
        this.ctx.helper.errCode.CANNOT_DELETE_GAME_CREATED_BY_OTHER
      )
    }
    await this.ctx.model.Game.findByIdAndDelete(gameId)
    return '删除成功'
  }
}