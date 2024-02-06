const database = require('./databaseConnection');

const itemsInQueueCount = async () => {
    return await new Promise((resolve, reject) => {
      database.connection.query(
        `SELECT count(*) as in_queue FROM links WHERE parsed_at IS NULL`,
        (err, count) => {
          if (err) {
            reject(0);
          }
          resolve(count[0].in_queue || 0); 
        },
      );
    });  
  }

const itemsDoneToday = async () => {
    return await new Promise((resolve, reject) => {
        database.connection.query(
        `SELECT count(*) as in_queue FROM links WHERE parsed_at = CURDATE()`,
        (err, count) => {
            if (err) {
            reject(0);
            }
            resolve(count[0].in_queue || 0); 
        },
        );
    });  
}

module.exports = {
    itemsInQueueCount,
    itemsDoneToday
}