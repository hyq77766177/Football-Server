// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAccount from '../../../app/controller/account';
import ExportGame from '../../../app/controller/game';
import ExportHome from '../../../app/controller/home';
import ExportReferee from '../../../app/controller/referee';

declare module 'egg' {
  interface IController {
    account: ExportAccount;
    game: ExportGame;
    home: ExportHome;
    referee: ExportReferee;
  }
}
