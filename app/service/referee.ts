import { Service } from 'egg'

export default class Referee extends Service {
  public async queryReferee(refereeId?: string) {
    if (!this.ctx.user?.isAdmin) {
      const { CustomError, errCode } = this.ctx.helper
      throw new CustomError(errCode.LOW_AUTHENTICATION)
    }
    if (!refereeId) {
      return await this.ctx.model.Referee.find()
    }
    return await this.ctx.model.Referee.findById(refereeId)
  }

  // public async registReferee(body) {}
}
