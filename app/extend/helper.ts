const errCode = {
  INVALID_PARAM: 400,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,

  PWD_INCONSISTENT: 1000,
  USER_DUPLICATE: 1001,
  NO_USER: 1002,
  NOT_SIGNIN: 1003,

  WX_SIGNATURE_INVALID: 1004,
  WX_CODE_ERROR: 40029,
}

const errCode2MsgMap = new Map([
  [errCode.NOT_FOUND, '资源不存在'],
  [errCode.INVALID_PARAM, '请求参数错误'],
  [errCode.INTERNAL_ERROR, '服务内部错误'],

  [errCode.PWD_INCONSISTENT, '密码不一致'],
  [errCode.USER_DUPLICATE, '用户重复'],
  [errCode.NO_USER, '用户不存在'],
  [errCode.NOT_SIGNIN, '会话超时或未登录'],

  [errCode.WX_CODE_ERROR, '微信code错误'],
  [errCode.WX_SIGNATURE_INVALID, '签名错误或session过期'],
])

const responseFormat = <T = any>(data: T) => ({
  data,
  errMsg: '',
  status: 0,
})

export default {
  errCode,
  responseFormat,
  getErrMsg: (code: number) => errCode2MsgMap.get(code),
}
