import { Service } from 'egg'
import { some, isEqual } from 'lodash'

/**
 * Enrol Service
 * @export
 * @class Enrol
 * @extends {Service}
 */
export default class Enrol extends Service {
  public async enrolGame(isUpdate: boolean) {
    const { gameId, availablePeriod, refereeName } = this.ctx.request.body
    const { user } = this.ctx
    const game = await this.ctx.model.Game.findById(gameId)
    if (!game) {
      this.ctx.bizErrorCode = this.ctx.helper.errCode.BAD_GAME_ID
      return
    }
    const isEnrolled = some(game.referees, ({ referee }) => isEqual(referee._id, user._id))
    if (isEnrolled && !isUpdate) {
      this.ctx.bizErrorCode = this.ctx.helper.errCode.CANNOT_RE_ENROL
      return
    }
    await game.update(
      {
        [isUpdate ? '$set' : '$push']: {
          referees: { referee: user._id, availablePeriod, enrolName: refereeName },
        },
      },
      { upsert: true }
    )
    return `${isUpdate ? '更新' : '报名'}成功`
  }

  public async cancelEnrol() {
    const { gameId } = this.ctx.request.body
    const { _id } = this.ctx.user
    const game = await this.ctx.model.Game.findById(gameId)
    if (!game) {
      this.ctx.bizErrorCode = this.ctx.helper.errCode.BAD_GAME_ID
      return
    }
    if (!some(game.referees, ({ referee }) => isEqual(referee._id, this.ctx.user._id))) {
      this.ctx.bizErrorCode = this.ctx.helper.errCode.CANNOT_CANCEL_NOT_ENROLED_GAME
      return
    }
    await this.ctx.model.Game.findOneAndUpdate(
      { _id: gameId },
      { $pull: { referees: { referee: _id } } }
    )
    return '取消成功'
  }
}
