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
  const gameSchema = new Schema(
    {
      gameName: String,
      gameDate: String,
      gameTime: String,
      gameEndTime: String,
      gameAvailablePeriod: [String],
      refereeNumber: Number,
      openid: String,
      referees: [
        {
          type: Number,
          ref: 'Referee',
        },
      ],
    },
    {
      toObject: {
        transform(_, ret) {
          delete ret.__v
        },
      },
    }
  )
  return app.mongoose.model<GameModel>('Game', gameSchema)
}
