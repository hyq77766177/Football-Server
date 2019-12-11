import { Application } from 'egg'
import { Document } from 'mongoose'
import { RefereeModel } from './referee'

export interface GameModel extends Document {
  gameName: string
  gameStartTime: number
  gameEndTime: number
  gameAvailablePeriod: string[]
  requiredRefereeAmount: number
  publisher: {
    id: string
    avatar: string
  }
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
    gameStartTime: Schema.Types.Date,
    gameEndTime: Schema.Types.Date,
    gameAvailablePeriod: [String],
    requiredRefereeAmount: Number,
    publisher: {
      id: String,
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
  gameSchema.index({ gameStartTime: -1 })
  return app.mongoose.model<GameModel>('Game', gameSchema)
}
