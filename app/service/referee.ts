import { Service } from 'egg'

export default class Referee extends Service {
  public async queryReferee(refereeId?: string) {
    if (!this.ctx.user?.isAdmin) {
      const { CustomError, errCode } = this.ctx.helper
      throw new CustomError(errCode.NO_PERMISSION)
    }
    if (!refereeId) {
      return await this.ctx.model.Referee.find()
    }
    return await this.ctx.model.Referee.findById(refereeId)
  }

  public async updateRefereeInfo(body: refereeRequest.IUpdateInfo) {
    const { errCode, CustomError } = this.ctx.helper
    if (!this.ctx.user) {
      throw new CustomError(errCode.NOT_SIGNIN)
    }
    const { _id } = this.ctx.user
    await this.ctx.model.Referee.findByIdAndUpdate(_id, body, { upsert: true })
    return { refereeId: _id }
  }
}
