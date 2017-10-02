/// <reference path="./config.ts" />

import * as log4js from 'log4js';
import * as mongodb from 'mongodb'
import { config } from './config';
import { server } from './app'

log4js.configure(config.log4js_conf);
const logger = log4js.getLogger('mongoUtil.js');

export type gameData = {
    _id: mongodb.ObjectId;
    gameName: string,
    gameDate: string,
    gameTime: string,
    gameEndTime: string,
    refereeNumber: number,
    openid: string,
    referees?: string[],
    refereeIds?: string[],
}

export namespace mongoUtil {
    /**
     * insert data to db.col
     * @param {mongodb.Db} db
     * @param {string} col collection
     * @param {any} data data to be inserted
     * @param {function} callback
     */
    export function insertData (db: mongodb.Db, col: string, data, callback: Function) {
        //连接到表 games
        const collection = db.collection(col);
        collection.insert(data, (err, result) => {
            if (err) {
                logger.error('Error:', err)
                return
            }
            callback(result)
        })
    }

    /**
     * show all data from db.col
     * @param {mongodb.Db} db
     * @param {string} col collection
     * @param {function} callback
     */
    export function showAllData(db: mongodb.Db, col: string, openid: string, callback: Function) {
        const collection = db.collection(col);
        collection.find({ "openid": openid }).toArray((err, result) => {
            if (err) {
                logger.error('Error: ', err);
                return;
            }
            callback(result);
        })
    }

    export function queryGameById(db: mongodb.Db, col: string, id: string, callback: Function) {
        const collection = db.collection(col);
        const objId = new mongodb.ObjectId(id);
        const queryData = { "_id": objId };
        collection.find(queryData).toArray((err, result) => {
            if (err) {
                logger.error('Error: ', err);
                return;
            }
            callback(result);
        });
    }

    export function enrol(db: mongodb.Db, col: string, data: server.enrolReq) {
        logger.debug('mongoUtil.enrol has invoked');
        const collection = db.collection(col);
        const id = data.gameId;
        queryGameById(db, col, id, result => {
            if (!result.referees) {
                result['referees'] = [];
            }
            let newRefArr = (result['referees'] as server.enrolReq[]).push(data);
            collection.update({ "_id": new mongodb.ObjectId(id) }, { $set: { "referees": newRefArr }}).catch(e => {
                logger.error('update error: ', e);
            })
        });
    }
}
