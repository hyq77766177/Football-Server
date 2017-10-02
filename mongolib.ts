/// <reference path="./config.ts" />

import * as log4js from 'log4js';
import * as mongodb from 'mongodb'
import { config } from './config';

log4js.configure(config.log4js_conf);
const logger = log4js.getLogger('mongoUtil.js');

export namespace mongoUtil {
    /**
     * insert data to db.col
     * @param {string} db
     * @param {string} col collection
     * @param {any} data data to be inserted
     * @param {function} callback
     */
    export function insertData (db, col, data, callback) {
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
     * @param {string} db
     * @param {string} col collection
     * @param {function} callback
     */
    export function showAllData(db, col, openid, callback) {
        const collection = db.collection(col);
        collection.find({ "openid": openid }).toArray((err, result) => {
            if (err) {
                logger.error('Error: ', err);
                return;
            }
            callback(result);
        })
    }

    export function queryGameById(db, col, id, callback) {
        const collection = db.collection(col);
        const objId = new mongodb.ObjectId(id);
        const queryData = { "_id": objId };
        collection.find(queryData).toArray((err, result) => {
            if (err) {
                logger.error('Error: ', err);
                return;
            }
            callback(result);
        })
    }

    // export function enrol(db: mongodb.Db, col, formData, callback) {
    //     const collection = db.collection(col);
    //     collection.update({  }, )
    // }
}
