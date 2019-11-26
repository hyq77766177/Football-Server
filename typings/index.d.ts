import 'egg'
import { Document } from 'mongoose'
import { RefereeModel } from '../app/model/referee'

declare module 'egg' {
  interface Context {
    model: IModel
    user: RefereeModel
    session: null | IBizSession
  }

  interface IBizSession {
    openid?: string | null
    sessionKey?: string | null
    [key: string]: any
  }
}
