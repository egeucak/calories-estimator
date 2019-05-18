const fs = require('fs');

class CsvWriter {
    constructor() {
        this.head = ['name,ingredients,calories,fat,carbs,protein,image'];
        this.data = [];
    }

    registerItem(item) {
        this.data.push(item);
    }

    write(filename) {
        const csv = this.head.concat(this.data.map(data => data.convertToCsv())).join('\n');
        fs.writeFileSync(`${__dirname}/${filename}`, csv);
    }
}
const csvWriter = new CsvWriter('data.csv');
module.exports = csvWriter;