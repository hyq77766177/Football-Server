import { Context } from 'egg'
import { isArray, some, isEqual } from 'lodash'
import { app, assert } from 'egg-mock/bootstrap'

const mockUser = {
  refereeName: 'test',
  id: 'test123',
  _id: 'test123',
  openid: 'test123',
  isAdmin: false,
  userInfo: {
    avatarUrl: 'https://img.test.com',
    city: 'Beijing',
    country: 'China',
    gender: 1,
    language: 'zh_CN',
    nickName: 'TestName',
    province: 'Beijing',
  },
}

describe('test/app/controller/game.test.ts', () => {
  let ctx: Context
  let gameId: string

  beforeEach(() => {
    ctx = app.mockContext({ user: mockUser })
    app.mockSession({
      openid: 'test123',
      session_key: 'test_session_key',
    })
  })

  it('should successfully login', async () => {
    const result = await app
      .httpRequest()
      .post('/api/login')
      .send({
        userInfo: mockUser.userInfo,
        code: 'test',
        identity: {
          rawData: 'test',
          signature: 'test',
        },
      })
      .expect(200)
    assert.ok(result.body.status === 0)
    mockUser.id = result.body.data.id
    mockUser._id = result.body.data.id
  })

  it('should get all games', async () => {
    const result = await app
      .httpRequest()
      .get('/api/game')
      .expect(200)
    const { data } = result.body
    assert.ok(isArray(data.myCreatedGames))
    assert.ok(isArray(data.myEnroledGames))
    assert.ok(isArray(data.availableGames))
  })

  it('should create a game', async () => {
    const result = await app
      .httpRequest()
      .post('/api/game')
      .type('application/json')
      .send({
        gameName: 'test',
        gameStartTime: 1576819860800,
        gameEndTime: 1576819960800,
        gameAvailablePeriod: ['t1', 't2'],
        requiredRefereeAmount: 4,
        avatar: 'http://img.sorayamah.org/test.png',
      })
      .expect(201)

    assert.ok(result.body.status === 0)
    gameId = result.body?.data?.gameId
  })

  it('should enrol a game', async () => {
    const result = await app
      .httpRequest()
      .post('/api/enrol')
      .type('application/json')
      .send({
        gameId,
        availablePeriod: ['t1'],
        refereeName: 'testName',
      })
      .expect(200)

    assert.ok(result.body.status === 0)
    assert.ok(result.body.data === '报名成功')
    const enroledGame = await ctx.model.Game.findById(gameId)
    assert.ok(
      enroledGame && some(enroledGame.referees, r => isEqual(String(r.referee._id), ctx.user?._id))
    )
  })

  it('should NOT enrol again', async () => {
    const result = await app
      .httpRequest()
      .post('/api/enrol')
      .accept('application/json')
      .type('application/json')
      .send({
        gameId,
        availablePeriod: ['t1'],
        refereeName: 'testName',
      })
      .expect(200)

    assert.ok(result.body.status === ctx.helper.errCode.CANNOT_RE_ENROL)
  })

  it('should update enrol', async () => {
    const result = await app
      .httpRequest()
      .put('/api/enrol')
      .type('application/json')
      .send({
        gameId,
        availablePeriod: ['t1'],
        refereeName: 'testNameUpdated',
      })
      .expect(200)

    assert.ok(result.body.status === 0)
    assert.ok(result.body.data === '更新成功')
    const enroledGame = await ctx.model.Game.findById(gameId)
    assert.ok(enroledGame && some(enroledGame.referees, r => r.enrolName === 'testNameUpdated'))
  })

  it('should cancel enrol', async () => {
    const result = await app
      .httpRequest()
      .del('/api/enrol')
      .type('application/json')
      .send({
        gameId,
      })
      .expect(200)
    assert.ok(result.body.status === 0)
  })

  it('should delete a game', async () => {
    const result = await app
      .httpRequest()
      .del('/api/game')
      .type('application/json')
      .send({
        gameId,
      })
      .expect(200)
    assert.ok(result.body.status === 0)
    assert.ok(result.body.data === '删除成功')
  })
})
