require('dotenv').config();
const fs = require('fs');

const csvWriter = require('./CsvWriter');
const { Food } = require('./Food');

const timeoutWait = (seconds) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(`Waiting for ${seconds} ms`);
            resolve()
        }, seconds);
    })
}

const main = async () => {
    const startTime = Date.now();
    const labels = fs.readFileSync('./labels.txt', 'utf-8').split('\n').filter(label => label.length > 0);
    let counter = 0;
    for (let i = 0; i < labels.length; i++) {
        const foodName = labels[i];
        if (counter===5) {
            csvWriter.write().then(() => console.log("Finished a part"));
            console.log(`${(Date.now() - startTime) / (1000 * 60)} minutes since start`);
            await timeoutWait(60 * 1000);
            counter = 0;
        }
        const food = new Food(foodName);
        console.log("Getting food ", food.name);
        await food.getNutritionInfo();
        counter++;
    }
    csvWriter.write().then(() => console.log("Done"));
}

main();
