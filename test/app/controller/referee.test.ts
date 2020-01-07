import { Context } from 'egg'
import { app, assert } from 'egg-mock/bootstrap'

const mockUser = {
  refereeName: 'test',
  id: 'test123',
  _id: 'test123',
  openid: 'test123',
  isAdmin: true,
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

describe('test/app/controller/referee.test.ts', () => {
  let ctx: Context
  let userId: string

  beforeEach(() => {
    ctx = app.mockContext({ user: mockUser })
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

  it('should get referee info', async () => {
    const result = await app
      .httpRequest()
      .get('/api/referee')
      .accept('application/json')
      .expect(200)
    assert.ok(result.body.status === 0)
  })

  it('should NOT get referee info as no permission', async () => {
    await ctx.model.Referee.findByIdAndUpdate(mockUser._id, { isAdmin: false })
    const result = await app
      .httpRequest()
      .get('/api/referee')
      .accept('application/json')
      .expect(200)
    assert.ok(result.body.status === ctx.helper.errCode.NO_PERMISSION)
  })

  it('should update referee info', async () => {
    const result = await app
      .httpRequest()
      .post('/api/referee')
      .type('application/json')
      .accept('application/json')
      .send({
        refereeName: 'testName',
        refereeHeight: '170cm',
        refereeWeight: '60kg',
        refereePhoneNumber: '1111111111',
        refereeIdNumber: '1111111',
        refereeScholarId: '44444',
        refereeBankNumber: '44444',
        refereeCardNumber: '2333',
        refereeClass: '1',
      })
      .expect(200)
    assert.ok(result.body.status === 0)
  })
})
