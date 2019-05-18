const createCsvWriter = require('csv-writer').createObjectCsvWriter;

class CsvWriter {
    constructor(filename) {
        this.header = [
            { id: 'name', title: 'name' },
            { id: 'image', title: 'image' },
            { id: 'ingredients', title: 'ingredients' },
            { id: 'calories', title: 'calories' },
            { id: 'fat', title: 'fat' },
            { id: 'carbs', title: 'carbs' },
            { id: 'protein', title: 'protein' },
        ];
        this.data = [];
        this.csvWriter = createCsvWriter({
            path: filename,
            header: this.header
        });
    }

    registerItem(item) {
        this.data.push(item);
    }

    write() {
        return new Promise((resolve, reject) => {
            const data = this.data.map(data => data.convertToCsv());
            this.csvWriter
                .writeRecords(data)
                .then(() => {
                    this.data = [];
                    resolve();
                });
        });
    }
}
const csvWriter = new CsvWriter('data.csv');
module.exports = csvWriter;