import { Application } from 'egg'

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

  return app.mongoose.model('Game', gameSchema)
}
