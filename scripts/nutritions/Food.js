const axios = require('axios');
const querystring = require('querystring');
const request = require('request');

const CsvWriter = require('./CsvWriter');
class Food {
    constructor(name) {
        this.name = name;
        this.children = [];
    }

    getNutritionInfo() {
        return new Promise((resolve, reject) => {
            const url = this.getNutritionSearchUrl();
            axios.get(url)
                .then(data => data.data)
                .then(data => data.hits)
                .then((data) => {
                    this.children = data.map((food) => {
                        const recipe = food.recipe;
                        const name = recipe.label;
                        const image = recipe.image;
                        const portions = recipe.yield || 1;
                        const ingredients = recipe.ingredientLines;
                        const nutrients = recipe.totalNutrients;
                        const calories = this.quantityOrZero(nutrients, 'ENERC_KCAL');
                        const fat = this.quantityOrZero(nutrients, 'FAT');
                        const carbs = this.quantityOrZero(nutrients, 'CHOCDF');
                        const protein = this.quantityOrZero(nutrients, 'PROCNT');

                        const foodEntity = new FoodModel(name, image);
                        foodEntity.nutrients.calories = calories / portions;
                        foodEntity.nutrients.fat = fat / portions;
                        foodEntity.nutrients.carbs = carbs / portions;
                        foodEntity.nutrients.protein = protein / portions;
                        foodEntity.ingredients = ingredients;
                        return food;
                    });
                    resolve(this.children);
                })
                .catch((err) => {
                    console.log("Error in ", url);
                    reject(err);
                });
        });
    }

    getNutritionSearchUrl() {
        const baseUrl = 'https://api.edamam.com/search';
        const params = {
            q: this.name,
            app_id: process.env.INGREDIENT_APP_ID,
            app_key: process.env.INGREDIENT_APP_KEY,
            to: 5
        };
        const url = `${baseUrl}?${querystring.stringify(params)}`;
        return url;
    }


    quantityOrZero(nutrient, type) {
        let quantity;
        try {
            quantity = nutrient[type].quantity;
        } catch(err) {
            quantity = 0;
        }
        return quantity;
    }
}

class FoodModel {
    constructor(name, image) {
        this.name = name;
        this.image = image;
        this.ingredients = [];
        this.nutrients = {
            calories: -1,
            fat: -1,
            carbs: -1,
            protein: -1
        }
        CsvWriter.registerItem(this);
    }

    convertToCsv() {
        const ingredients = this.ingredients.join('|');
        const data = {
            name: this.name,
            ingredients: ingredients,    // TODO: Get this
            calories: this.nutrients.calories,
            fat: this.nutrients.fat,
            carbs: this.nutrients.carbs,
            protein: this.nutrients.protein,
            image: this.image,
        };
        return data;
    }

    convertFromCsv(foodData) {
        this.name = foodData.name;
        this.image = foodData.image;
        this.ingredients = foodData.ingredients.split('|');
        this.nutrients.calories = foodData.calories;
        this.nutrients.carbs = foodData.carbs;
        this.nutrients.fat = foodData.fat;
        this.nutrients.protein = foodData.protein;
        return this;
    }

    getIngredients() {
        return new Promise((resolve, reject) => {
            const baseUrl = 'http://api.textrazor.com';
            const data = {
                text: this.ingredients.join(' '),
                extractors: 'entities'
            };
            const headers = {
                'X-TextRazor-Key': process.env.TEXT_RAZOR_APP_KEY,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            new Promise((resolve, reject) => {
                request.post(
                    baseUrl,
                    {
                        headers,
                        form: data
                    }
                , (err, resp, body) => {
                    if(err) return reject(err);
                    resolve(JSON.parse(body));
                })
            })
            .then(data2 => data2.response)
            .then(data3 => data3.entities)
            .then((data) => {
                const ingredients = this.filterIngredients(data);
                this.ingredients = ingredients;
                console.log(this.name);
                resolve(ingredients);
            })
            .catch((err) => {
                console.log("", err);
            });
        });
    }

    filterIngredients(dataArray) {
        const ingredientSet = new Set();
        const ingredients = dataArray.reduce((acc, curr, ind) => {
            if (
                curr.freebaseTypes
                && (curr.freebaseTypes.indexOf('/food/food') > -1
                || curr.freebaseTypes.indexOf('/food/ingredient') > -1)
            ) {
                acc.add(curr.entityId);
            }
            return acc;
        }, ingredientSet);
        return Array.from(ingredients);
    }
}

module.exports = {
    Food,
    FoodModel
};