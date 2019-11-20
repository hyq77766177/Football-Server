import { Service } from 'egg'

export default class Account extends Service {
  public async getWeixinSession() {
    const { code } = this.ctx.request.query
    const { APPID, APPSECRET } = process.env
    const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appId=${APPID}&secret=${APPSECRET}&js_code=${code}&grant_type=authorization_code`
    this.ctx.logger.debug('wxurl', wxUrl)
    try {
      const resp = await this.ctx.curl(wxUrl, { contentType: 'application/json' })
      const data = (resp.data as Buffer).toString()
      return JSON.parse(data)
    } catch (e) {
      this.ctx.logger.error(e)
      this.ctx.bizErrorCode = this.ctx.helper.errCode.INTERNAL_ERROR
      return
    }
  }
}
