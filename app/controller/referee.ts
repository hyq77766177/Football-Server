import { Controller } from 'egg'

export default class Referee extends Controller {
  public async getReferee() {
    const { refereeId } = this.ctx.query
    const result = await this.ctx.service.referee.queryReferee(refereeId)
    this.ctx.body = this.ctx.helper.responseFormat(result)
    return
  }

  // public async updateReferee() {
  //   const rules = {}
  // }
}
