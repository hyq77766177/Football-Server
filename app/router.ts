import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router } = app

  router.get('/', controller.home.index)
  router.post('/api/login', controller.account.login)
  router.get('/api/game', controller.game.getGame)
  router.post('/api/game', controller.game.createGame)
}
