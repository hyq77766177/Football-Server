import { Application } from 'egg'
import { Document } from 'mongoose'
import { RefereeModel } from './referee'

export interface GameModel extends Document {
  gameName: string
  gameStartTime: number
  gameEndTime: number
  gameAvailablePeriod: string[]
  requiredRefereeAmount: number
  gamePublisher: {
    name: string
    userInfo: RefereeModel
  }
  referees: Array<{
    _id: string
    referee: RefereeModel
    assigned: boolean
    enrolName: string
    availablePeriod: string[]
  }>
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
    gamePublisher: {
      name: String,
      userInfo: {
        type: ObjectId,
        ref: 'Referee',
      },
    },
    referees: {
      type: [
        {
          referee: {
            type: ObjectId,
            ref: 'Referee',
          },
          assigned: {
            type: Boolean,
            default: false,
          },
          availablePeriod: [String],
          enrolName: String,
        },
      ],
      default: [],
    },
    __v: { type: Number, select: false },
  })
  gameSchema.index({ gameStartTime: -1 })
  return app.mongoose.model<GameModel>('Game', gameSchema)
}
