import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router, middleware } = app
  // index
  router.get('/', controller.home.index)
  // login
  router.post('/api/login', controller.account.login)
  // account
  router.post('/api/admin', middleware.authentication(), controller.account.setAdmin)
  // game
  router.get('/api/game', controller.game.getGame)
  router.post('/api/game', middleware.authentication(), controller.game.createGame)
  router.del('/api/game', middleware.authentication(), controller.game.deleteGame)
  // enrol
  router.post('/api/game/enrol', middleware.authentication(), controller.game.enrolGame)
  router.put('/api/game/enrol', middleware.authentication(), controller.game.updateEnrol)
  router.delete('/api/game/enrol', middleware.authentication(), controller.game.cancelEnrol)
  // assign
  router.put('/api/game/assign', middleware.authentication(), controller.game.assign)
  // referee
  router.get('/api/referee', middleware.authentication(), controller.referee.getReferee)
  router.post('/api/referee', middleware.authentication(), controller.referee.updateReferee)
}
