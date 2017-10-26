/// <reference path="./config.ts" />

import * as log4js from 'log4js';
import * as mongodb from 'mongodb'
import { config } from './config';
import { server } from './app';
import * as assert from 'assert';

log4js.configure(config.log4js_conf);
const logger = log4js.getLogger('mongoUtil.js');

export namespace mongoUtil {

    export const mongoUrl = `mongodb://${config.mongoUser}:${config.mongoPass}@${config.mongoHost}:${config.mongoPort}/${config.mongoDb}`;

    export function insertData(db: mongodb.Db, col: string, data: server.createGameData) {
        const collection = db.collection(col);
        return collection.insertOne(data);
    }

    // export function myCreatedGames(db: mongodb.Db, col: string, openid: string, callback: Function) {
    //     const collection = db.collection(col);
    //     collection.find({ "openid": openid })
    //         .toArray((err, result) => {
    //             if (err) {
    //                 logger.error('Error: ', err);
    //                 return;
    //             }
    //             callback(result);
    //         })
    // }

    export function queryGames(db: mongodb.Db, col: string, query: Object) {
        const collection = db.collection(col);
        return collection.find<server.gameData>(query).toArray(); //{ "referees.openid": openid })
    }

    // export function allGames(db: mongodb.Db, col: string) {
    //     const collection = db.collection(col);
    //     return collection.find().toArray();
    // }

    /** callback 参数是一个比赛 */
    export function queryGameById(db: mongodb.Db, col: string, id: string, callback: Function) {
        const collection = db.collection(col);
        const objId = new mongodb.ObjectId(id);
        const queryData = { "_id": objId };
        collection.find(queryData).toArray((err, result) => {
            if (err) {
                logger.error('Query by id Error: ', err);
                return;
            }
            callback(result[0]);
        });
    }

    export function enrol(db: mongodb.Db, col: string, data: server.enrolReq, callback: Function) {
        logger.debug('mongoUtil.enrol has invoked');
        const collection = db.collection(col);
        const id = new mongodb.ObjectId(data.gameId);
        const document = collection.find({ "_id": id });
        collection.update({
            "_id": id,
        }, {
                "$push": { "referees": data }
            }, {
                upsert: true
            }).catch(e => {
                logger.error('update error:', e);
                callback(e);
            });
        callback(null);
    }

    export function enrolUpdate(db: mongodb.Db, col: string, data: server.enrolReq, callback: Function) {
        logger.debug('mongoUtil.enrolUpdate has been invoked, data: ', data);
        const id = new mongodb.ObjectId(server.getValue(data, "gameId"));
        const collection = db.collection(col);
        collection.updateOne({
            "_id": id,
            "referees.openid": server.getValue(data, "openid"),
        },
            {
                "$set": {
                    "referees.$": data,
                },
            })
            .catch(e => {
                logger.error('update pull error:', e);
                callback(e);
            });
        callback(null);
    }

    export function cancelEnrol(db: mongodb.Db, col: string, data: server.cancelEnrolData, callback: Function) {
        logger.debug('mongoUtil.cancelEnrol has been invoked, data: ', data);
        const id = new mongodb.ObjectId(server.getValue(data, "gameId"));
        const collection = db.collection(col);
        collection.update({
            "_id": id,
        }, {
                "$pull": {
                    "referees": {
                        openid: server.getValue(data, "openid"),
                    }
                },
            }).catch(e => {
                logger.error('cancel error:', e);
                callback(e);
            });
        callback(null);
    }

    export function update(db: mongodb.Db, col: string, data: server.assignData, filter: object, update: object) {
        logger.info('mongoUtil.assign has been invoked, data: ', data);
        const collection = db.collection(col);
        return collection.update(filter, update);
    };

    export function deleteGame(db: mongodb.Db, col: string, data: server.deleteGameData, callback: Function) {
        logger.debug('mongo deleteGame has been invoked, data: ', data);
        const id = new mongodb.ObjectId(server.getValue(data, "gameId"));
        const collection = db.collection(col);
        collection.remove({
            "_id": id,
        }).catch(e => {
            logger.error('delete game error: ', e);
            callback(e);
        });
        callback(null);
    }
}
