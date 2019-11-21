import crypto from 'crypto'
import { Service } from 'egg'

export interface IWeixinUserInfo {
  avatarUrl: string
  city: string
  country: string
  /** 1: ♂ */
  gender: number
  language: string
  nickName: string
  province: string
}

export default class Account extends Service {
  public async validateWeixinSession() {
    const {
      code,
      userInfo,
      identity: { signature, rawData },
    } = this.ctx.request.body
    const { APP_ID, APP_SECRET } = process.env
    const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appId=${APP_ID}&secret=${APP_SECRET}&js_code=${code}&grant_type=authorization_code`
    this.ctx.logger.debug('wxurl', wxUrl)
    try {
      const resp = await this.ctx.curl(wxUrl, { contentType: 'application/json' })
      const data = (resp.data as Buffer).toString()
      const parsed = JSON.parse(data)
      if (parsed.errcode) {
        this.ctx.bizErrorCode = this.ctx.helper.errCode.WX_CODE_ERROR
        return
      }
      const { session_key, openid } = parsed
      const hashed = crypto
        .createHash('sha1')
        .update(`${rawData}${session_key}`)
        .digest('hex')
      this.ctx.logger.debug('parsed, ', parsed, `hashed: ${hashed}`)
      if (hashed !== signature) {
        this.ctx.bizErrorCode = this.ctx.helper.errCode.NOT_SIGNIN
        return
      }
      this.ctx.session = {
        openid,
      }
      await this.setUser(openid, userInfo)
      return '登陆成功'
    } catch (e) {
      this.ctx.logger.error(e)
      this.ctx.bizErrorCode = this.ctx.helper.errCode.INTERNAL_ERROR
    }
  }

  private async setUser(openid: string, userInfo: IWeixinUserInfo) {
    const { Referee } = this.ctx.model
    const user = await Referee.findOne({ openid })
    if (!user) {
      await Referee.create({
        openid,
        refereeWeixinInfo: userInfo,
      })
    } else {
      await Referee.updateOne(
        { openid },
        {
          refereeWeixinInfo: userInfo,
        }
      )
    }
  }
}
