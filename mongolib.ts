/// <reference path="./config.ts" />

import * as log4js from 'log4js';
import * as mongodb from 'mongodb'
import * as assert from 'assert';

import { config } from './config';
import { game } from './game';
import { types } from './types';

log4js.configure(config.log4js_conf);
const logger = log4js.getLogger('mongoUtil.js');

export namespace mongoUtil {

    export const mongoUrl = `mongodb://${config.mongoUser}:${config.mongoPass}@${config.mongoHost}:${config.mongoPort}/${config.mongoDb}`;

    export function insertData<T>(db: mongodb.Db, col: string, data: T) {
        logger.info('mongo insert data has been invoked');
        const collection = db.collection(col);
        return collection.insertOne(data);
    }

    export function queryGames(db: mongodb.Db, col: string, query: Object) {
        logger.info('mongo query games has been invoked');
        const collection = db.collection(col);
        return collection.find<types.gameData>(query).toArray();
    }

    export function queryGameById(db: mongodb.Db, col: string, id: string) {
        logger.info('mongo query by id has been invoked');
        const collection = db.collection(col);
        const objId = new mongodb.ObjectId(id);
        const queryData = { "_id": objId };
        return collection.findOne<types.gameData>(queryData);
    }

    export function update(db: mongodb.Db, col: string, filter: object, update: object, options?: mongodb.ReplaceOneOptions & { multi?: boolean }) {
        logger.info('mongoUtil.update has been invoked');
        const collection = db.collection(col);
        return collection.update(filter, update, options);
    };

    export function deleteGameById(db: mongodb.Db, col: string, id: mongodb.ObjectId) {
        logger.info('mongo deleteGame has been invoked');
        const collection = db.collection(col);
        return collection.remove({ "_id": id })
    }
}
