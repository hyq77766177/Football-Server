import { Service } from 'egg'
import { some, isEqual } from 'lodash'

/**
 * Enrol Service
 * @export
 * @class Enrol
 * @extends {Service}
 */
export default class Enrol extends Service {
  public async enrolGame() {
    const { gameId } = this.ctx.query
    const { user } = this.ctx
    const game = await this.ctx.model.Game.findById(gameId)
    if (!game) {
      this.ctx.bizErrorCode = this.ctx.helper.errCode.BAD_GAME_ID
      return
    }
    const isEnrolled = some(game.referees, id => isEqual(id, user._id))
    if (isEnrolled) {
      this.ctx.bizErrorCode = this.ctx.helper.errCode.CANNOT_RE_ENROL
      return
    }
    await this.ctx.model.Game.findOneAndUpdate(
      { _id: gameId },
      { $push: { referees: user._id } },
      { upsert: true }
    )
    return '报名成功'
  }
}
