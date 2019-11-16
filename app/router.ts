import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router } = app

  router.get('/', controller.home.index)
  router.get('/api/game', controller.game.getGames)
  router.post('/api/game', controller.game.createGame)
}
