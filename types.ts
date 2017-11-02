import * as mongoDb from 'mongoDb';

export namespace types {

  /** 返回错误数据 */
  export type errMsg = {
    status: number,
    msg: string,
  };

  /** 比赛数据 */
  export type gameData = {
    "_id": mongoDb.ObjectId,
    "gameName": string,
    "gameDate": string,
    "gameTime": string,
    "gameEndTime": string,
    "refereeNumber": number,
    "openid": string,
    "referees"?: enrolReqData[],
  };

  /** 建立比赛的请求数据 */
  export type createGameData = {
    gameName: string,
    gameDate: string,
    gameEndTime: string,
    gameTime: string,
    refereeNumber: string,
    openid: string,
  };

  /** 获取openid的请求数据 */
  export type openidData = {
    code: string,
  };

  /** 获取所有比赛信息的请求数据 */
  export type allData = {
    openid: string,
  };

  /** 选派/撤销的请求数据 */
  export type assignData = {
    openid: string,
    gameId: string,
    assign: boolean,
  };

  /** 通过gameId查询比赛信息的请求数据 */
  export type gameByIdReqData = {
    colId: string,
  };

  /** 报名的请求数据 */
  export type enrolReqData = {
    gameId: string,
    openid: string,
    startRefTime: string,
    endRefTime: string,
    refereeName: string,
  };

  /** 取消报名的请求数据 */
  export type cancelEnrolData = {
    gameId: string,
    openid: string
  };

  /** 删除比赛的请求数据 */
  export type deleteGameData = {
    openid: string,
    gameId: string,
  };

}
