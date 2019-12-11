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
    id?: string | null
    openid?: string | null
    sessionKey?: string | null
    [key: string]: any
  }
}
