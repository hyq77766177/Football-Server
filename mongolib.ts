namespace mongoUtil {
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
                console.log('Error:', err)
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
        const collection = db.collection(col)
        collection.find().toArray((err, result) => {
            if (err) {
                console.log('Error: ', err)
                return
            }
            callback(result);
        })
    }
}
