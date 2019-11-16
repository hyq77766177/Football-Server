import { Application } from 'egg'
import { Document } from 'mongoose'
import { RefereeModel } from './referee'

export interface GameModel extends Document {
  gameName: string
  gameDate: string
  gameTime: string
  gameEndTime: string
  gameAvailablePeriod: string[]
  refereeNumber: number
  openid: string
  referees: RefereeModel[]
}

export default (app: Application) => {
  const mongoose = app.mongoose
  const { Schema } = mongoose
  const {
    Types: { ObjectId },
  } = Schema
  const gameSchema = new Schema({
    gameName: String,
    gameDate: String,
    gameTime: String,
    gameEndTime: String,
    gameAvailablePeriod: [String],
    requiredRefereeAmount: Number,
    publisher: {
      openid: String,
      avatar: { type: String, default: '' },
    },
    referees: {
      type: [
        {
          type: ObjectId,
          ref: 'Referee',
        },
      ],
      default: [],
    },
    __v: { type: Number, select: false },
  })
  gameSchema.index({ gameDate: -1 })
  return app.mongoose.model<GameModel>('Game', gameSchema)
}
