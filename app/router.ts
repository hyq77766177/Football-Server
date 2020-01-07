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
  router.post('/api/game/enrol', controller.game.enrolGame)
  router.put('/api/game/enrol', controller.game.updateEnrol)
  router.delete('/api/game/enrol', controller.game.cancelEnrol)
  // assign
  router.put('/api/game/assign', controller.game.assign)
  // referee
  router.get('/api/referee', controller.referee.getReferee)
  router.post('/api/referee', controller.referee.updateReferee)
}
