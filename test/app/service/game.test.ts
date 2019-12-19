import assert from 'assert'
import { Context } from 'egg'
import { app } from 'egg-mock/bootstrap'

describe('test/app/service/game.test.js', () => {
  let ctx: Context

  before(async () => {
    ctx = app.mockContext({
      user: {
        refereeName: 'test',
        id: 'test123',
        _id: 'test123',
        openid: '123',
        isAdmin: false,
      },
    })
  })

  it('should get games', async () => {
    const result = await ctx.service.game.getAll()
    assert(Array.isArray(result.availableGames))
    assert(Array.isArray(result.myCreatedGames))
    assert(Array.isArray(result.myEnroledGames))
  })
})
