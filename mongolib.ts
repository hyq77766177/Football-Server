/// <reference path="./config.ts" />

import * as log4js from 'log4js';
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
    export function showAllData(db, col, callback) {
        const collection = db.collection(col);
        collection.find().toArray((err, result) => {
            if (err) {
                logger.error('Error: ', err);
                return;
            }
            callback(result);
        })
    }

    export function queryGameById(db, col, id, callback) {
        const collection = db.collection(col);
        collection.find(JSON.parse(`{"_id":"${id}"})`)).toArray((err, result) => {
            if (err) {
                logger.error('Error: ', err);
                return;
            }
            callback(result);
        })
    }
}
