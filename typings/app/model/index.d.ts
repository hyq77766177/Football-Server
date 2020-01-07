// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportGame from '../../../app/model/game';
import ExportReferee from '../../../app/model/referee';

declare module 'egg' {
  interface IModel {
    Game: ReturnType<typeof ExportGame>;
    Referee: ReturnType<typeof ExportReferee>;
  }
}
