require('dotenv').config({ path: './.env' });
const fs = require('fs');
const Papa = require('papaparse');

const csvWriter = require('./CsvWriter');
const { Food, FoodModel } = require('./Food');

const timeoutWait = (seconds) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(`Waiting for ${seconds} ms`);
            resolve()
        }, seconds);
    })
}

const getNutritions = async () => {
    const startTime = Date.now();
    const labels = fs.readFileSync('./dinnerNames.csv', 'utf-8')
        .split('\n')
        .filter(label => label.length > 0)
        .map(elm => elm.split(',')[1]); // If not csv, comment this line
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

const getIngredients = async () => {
    const foods = [];
    Papa.parse(fs.createReadStream('dinnerNamesING.csv'), {
        delimiter: ',',
        header: true,
        step: (results) => {
            const foodData = results.data[0];
            const food = new FoodModel();
            food.convertFromCsv(foodData);
            foods.push(food);
        },
        complete: async () => {
            for (let i = 0; i < foods.length; i++) {
                try {
                    const food = foods[i];
                    await food.getIngredients();
                } catch(err) {
                    await csvWriter.write();
                    console.log(err);
                    return;
                }
            }
            await csvWriter.write();
        }
    });
}

getIngredients();
// getNutritions();
