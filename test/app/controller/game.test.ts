import { has } from 'lodash'
import { app, assert } from 'egg-mock/bootstrap'

describe('test/app/controller/game.test.ts', () => {
  it('should get all games', async () => {
    const result = await app
      .httpRequest()
      .get('/api/game')
      .expect(200)
    assert.ok(has(result.body?.data, 'myCreatedGames'))
  })
})
