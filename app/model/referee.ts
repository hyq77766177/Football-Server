import { Application } from 'egg'
import { Document } from 'mongoose'

export interface RefereeModel extends Document {
  refereeName: string
  refereeHeight: string
  refereeWeight: string
  refereePhoneNumber: string
  refereeIdNumber: string
  refereeScholarId: string
  refereeBankNumber: string
  refereeCardNumber: string
  refereeClass: string
  isAdmin: boolean
  openid: string
}

export default (app: Application) => {
  const mongoose = app.mongoose
  const { Schema } = mongoose
  const refereeSchema = new Schema({
    openid: { type: String, select: false },
    __v: { type: Number, select: false },
    refereeName: String,
    refereeHeight: String,
    refereeWeight: String,
    refereePhoneNumber: String,
    refereeIdNumber: String,
    refereeScholarId: String,
    refereeBankNumber: String,
    refereeCardNumber: String,
    refereeClass: String,
    refereeWeixinInfo: {
      avatarUrl: String,
      city: String,
      country: String,
      gender: Number,
      language: String,
      nickName: String,
      province: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  })
  return app.mongoose.model<RefereeModel>('Referee', refereeSchema)
}
