import { Service } from 'egg'

/**
 * Index Service
 */
export default class Home extends Service {
  /**
   * Hello message from egg
   */
  public async index() {
    return {
      title: '空山小站',
    }
  }
}
