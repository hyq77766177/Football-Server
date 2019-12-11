import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router } = app
  // index
  router.get('/', controller.home.index)
  // login
  router.post('/api/login', controller.account.login)
  // game
  router.get('/api/game', controller.game.getGame)
  router.post('/api/game', controller.game.createGame)
  router.del('/api/game', controller.game.deleteGame)
  // enrol
  router.put('/api/enrol', controller.game.enrolGame)
}
