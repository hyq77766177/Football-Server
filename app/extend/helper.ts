enum errCode {
  INVALID_PARAM = 400,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,

  PWD_INCONSISTENT = 1000,
  USER_DUPLICATE,
  NO_USER,
  NOT_SIGNIN,
  WX_SIGNATURE_INVALID,
  CANNOT_DELETE_GAME_CREATED_BY_OTHER,
  CANNOT_RE_ENROL,
  BAD_GAME_ID,
  CANNOT_CANCEL_NOT_ENROLED_GAME,
  LOW_AUTHENTICATION,

  WX_CODE_ERROR = 40029,
}

const errCode2MsgMap = new Map([
  [errCode.NOT_FOUND, '资源不存在'],
  [errCode.INVALID_PARAM, '请求参数错误'],
  [errCode.INTERNAL_ERROR, '服务内部错误'],

  [errCode.PWD_INCONSISTENT, '密码不一致'],
  [errCode.USER_DUPLICATE, '用户重复'],
  [errCode.NO_USER, '用户不存在'],
  [errCode.NOT_SIGNIN, '会话超时或未登录'],
  [errCode.LOW_AUTHENTICATION, '权限不足'],

  [errCode.WX_CODE_ERROR, '微信code错误'],
  [errCode.WX_SIGNATURE_INVALID, '签名错误或session过期'],
  [errCode.CANNOT_DELETE_GAME_CREATED_BY_OTHER, '不能删除他人创建的比赛'],
  [errCode.CANNOT_RE_ENROL, '不能重复报名'],
  [errCode.BAD_GAME_ID, '错误的比赛ID'],
  [errCode.CANNOT_CANCEL_NOT_ENROLED_GAME, '不能取消未报名的比赛'],
])

const responseFormat = <T = any>(data: T) => ({
  data,
  errMsg: '',
  status: 0,
})

class CustomError extends Error {
  public statusCode: number

  public message: string

  constructor(status: errCode) {
    super()
    this.statusCode = status
    this.message = errCode2MsgMap.get(status) || ''
  }

  public getInfo() {
    return {
      data: null,
      status: this.statusCode,
      message: this.message,
    }
  }
}

const inRange = (target: number, min: number, max: number) => target >= min && target <= max

class HttpError extends CustomError {
  constructor(status: errCode) {
    super(status)
    if (typeof status !== 'number' || !inRange(status, 200, 600)) {
      throw Error('Status code is not an valid http code')
    }
  }
}

export default {
  CustomError,
  HttpError,
  responseFormat,
  errCode,
  errCode2MsgMap,
}
