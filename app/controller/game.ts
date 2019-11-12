import { Controller } from 'egg'

export default class Game extends Controller {
  public async createGame() {
    this.ctx.body = JSON.stringify({
      status: 0,
    })
  }
}
