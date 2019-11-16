// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportGame from '../../../app/service/game';
import ExportHome from '../../../app/service/home';

declare module 'egg' {
  interface IService {
    game: ExportGame;
    home: ExportHome;
  }
}
