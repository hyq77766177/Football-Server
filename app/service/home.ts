import { Service } from 'egg'

/**
 * Index Service
 */
export default class Home extends Service {
  /**
   * Hello message from egg
   */
  public async sayHi() {
    return `Response from Egg, locale time ${new Date()}`
  }
}
