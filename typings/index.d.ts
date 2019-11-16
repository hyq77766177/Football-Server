import 'egg'

declare module 'egg' {
  interface Context {
    model: IModel
  }
}
