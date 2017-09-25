var mongoUtil;
(function (mongoUtil) {
    /**
     * insert data to db.col
     * @param {string} db
     * @param {string} col collection
     * @param {any} data data to be inserted
     * @param {function} callback
     */
    function insertData(db, col, data, callback) {
        //连接到表 games
        var collection = db.collection(col);
        collection.insert(data, function (err, result) {
            if (err) {
                console.log('Error:', err);
                return;
            }
            callback(result);
        });
    }
    mongoUtil.insertData = insertData;
    /**
     * show all data from db.col
     * @param {string} db
     * @param {string} col collection
     * @param {function} callback
     */
    function showAllData(db, col, callback) {
        var collection = db.collection(col);
        collection.find().toArray(function (err, result) {
            if (err) {
                console.log('Error: ', err);
                return;
            }
            callback(result);
        });
    }
    mongoUtil.showAllData = showAllData;
})(mongoUtil || (mongoUtil = {}));
