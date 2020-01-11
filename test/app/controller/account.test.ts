import { Context } from 'egg'
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

describe('test/app/controller/account.test.ts', () => {
  let ctx: Context
  let userId: string
  const targetOpenid = 'test2'

  before(async () => {
    ctx = app.mockContext({ user: mockUser })
    await ctx.model.Referee.create({
      openid: targetOpenid,
    })
  })

  beforeEach(() => {
    app.mockSession({
      id: userId || 'test123',
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
    userId = mockUser._id
  })

  it('should update a user to admin', async () => {
    await ctx.model.Auth.create({
      openid: mockUser.openid,
      admin: true,
      superAdmin: true,
    })
    const result = await app
      .httpRequest()
      .post('/api/admin')
      .type('application/json')
      .accept('application/json')
      .send({ openid: targetOpenid })
      .expect(200)
    const { status } = result.body
    assert.equal(status, 0)
  })

  it('should NOT update a user to admin for no permission', async () => {
    await ctx.model.Auth.updateOne(
      {
        openid: mockUser.openid,
      },
      { superAdmin: false }
    )
    const result = await app
      .httpRequest()
      .post('/api/admin')
      .type('application/json')
      .accept('application/json')
      .send({ openid: targetOpenid })
      .expect(200)
    const { status } = result.body
    assert.equal(status, ctx.helper.errCode.NO_PERMISSION)
  })

  after(async () => {
    await ctx.model.Auth.deleteMany({ openid: mockUser.openid })
    await ctx.model.Referee.deleteOne({ openid: targetOpenid })
  })
})
