const csv = require('csv-parser');
const fs = require('fs');
const database = require('./databaseConnection');


async function parseFileToDatabase(filePath) {
    const parsedLinks = [];

    await new Promise((resolve, reject) => {
        const links = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                const clearLink = getClearLink(data.URL);   
                links.push("('" + clearLink + "')");
                parsedLinks.push(clearLink);
            })
            .on('end', () => {
                const connection = database.connection;
                connection.query(
                    `INSERT INTO ${process.env.DATABASE_LINKS_TABLE_NAME} (link) VALUES ${links.join(',')}`,
                    (err, result) => {
                        if (err) { 
                            console.error(err); }
                    }
                );            
                resolve(parsedLinks);
            })
            .on('error', () => {
                reject();
            });
    })

    return parsedLinks;
}

const getClearLink = (link) => {
    const regex = /(.*)(\?.*)/gm;
    const linkPartials = regex.exec(link);
    return linkPartials && linkPartials.length > 1 ? linkPartials[1] : link;
};

module.exports = { parseFileToDatabase };