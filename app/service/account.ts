import crypto from 'crypto'
import { Service } from 'egg'

export default class Account extends Service {
  public async login(body: loginRequest.ILoginRequest) {
    const {
      code,
      userInfo,
      identity: { signature, rawData },
    } = body
    if (this.app.config.env === 'unittest' || this.app.config.env === 'ci') {
      const user = await this.setUser('test123', userInfo, true)
      return {
        id: user._id,
        isAdmin: user.isAdmin,
      }
    }
    const { APP_ID, APP_SECRET } = process.env
    const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appId=${APP_ID}&secret=${APP_SECRET}&js_code=${code}&grant_type=authorization_code`
    const resp = await this.ctx.curl(wxUrl, { contentType: 'application/json' })
    const data = (resp.data as Buffer).toString()
    const parsed = JSON.parse(data)
    if (parsed.errcode) {
      throw new this.ctx.helper.CustomError(this.ctx.helper.errCode.WX_CODE_ERROR)
    }
    const { session_key, openid } = parsed
    await this.validateSignature(signature, rawData, session_key)
    this.setSession(session_key, openid)
    const user = await this.setUser(openid, userInfo)
    return {
      id: user._id,
      isAdmin: user.isAdmin,
    }
  }

  public async validateSignature(signature: string, rawData: string, sessionKey?: string | null) {
    sessionKey = sessionKey || this.ctx.session?.sessionKey
    if (!sessionKey) {
      throw new this.ctx.helper.CustomError(this.ctx.helper.errCode.WX_SIGNATURE_INVALID)
    }
    const hashed = crypto
      .createHash('sha1')
      .update(`${rawData}${sessionKey}`)
      .digest('hex')
    if (hashed !== signature) {
      this.ctx.logger.warn('bad signature: hashed: %s, signature: %s', hashed, signature)
      throw new this.ctx.helper.CustomError(this.ctx.helper.errCode.NOT_SIGNIN)
    }
  }

  public setSession(sessionKey?: string | null, openid?: string | null) {
    this.ctx.session = {
      sessionKey,
      openid,
    }
  }

  private async setUser(openid: string, userInfo: loginRequest.IWeixinUserInfo, isAdmin = false) {
    const { Referee } = this.ctx.model
    let user = await Referee.findOne({ openid })
    if (!user) {
      user = await Referee.create({
        openid,
        refereeWeixinInfo: userInfo,
        isAdmin,
      })
    } else {
      user = await Referee.findOneAndUpdate(
        { openid },
        {
          refereeWeixinInfo: userInfo,
          isAdmin,
        }
      )
    }
    return user!
  }
}
