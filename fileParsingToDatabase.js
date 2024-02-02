const csv = require('csv-parser');
const fs = require('fs');
const database = require('./databaseConnection');


async function parseFileToDatabase(filePath) {
    const parsedLinks = [];
    
    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
            parsedLinks.push(data.link);
            const connection = database.connection;
            connection.query(
                `INSERT INTO ${process.env.DATABASE_LINKS_TABLE_NAME} (link) VALUES ('${data.link}')`,
                (err, result) => {
                    if (err) { 
                        console.error(err); }
                }
            );
            
        })
        .on('end', () => {
            resolve(parsedLinks);
        })
        .on('error', () => {
            reject();
        });
    })

    return parsedLinks;
}

module.exports = { parseFileToDatabase };