import assert from 'assert'
import { Context } from 'egg'
import { app } from 'egg-mock/bootstrap'

describe('test/app/service/home.test.js', () => {
  let ctx: Context

  before(async () => {
    ctx = app.mockContext()
  })

  it('home', async () => {
    const result = await ctx.service.home.index()
    assert(typeof result.title === 'string')
  })
})
