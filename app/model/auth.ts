import { Application } from 'egg'
import { Document } from 'mongoose'
import { RefereeModel } from './referee'

export interface AuthModel extends Document {
  openid: string
  user: RefereeModel
  admin: boolean
  superAdmin: boolean
}

export default (app: Application) => {
  const mongoose = app.mongoose
  const { Schema } = mongoose
  const {
    Types: { ObjectId },
  } = Schema
  const authSchema = new Schema({
    openid: {
      type: String,
      required: true,
    },
    user: {
      type: ObjectId,
      ref: 'Referee',
    },
    admin: {
      type: Boolean,
      default: false,
    },
    superAdmin: {
      type: Boolean,
      default: false,
    },
    __v: { type: Number, select: false },
  })
  return app.mongoose.model<AuthModel>('Auth', authSchema)
}
