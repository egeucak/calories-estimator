const axios = require('axios');
const querystring = require('querystring');

const CsvWriter = require('./CsvWriter');

class FoodModel {
    constructor(name, image) {
        this.name = name;
        this.ingredients = [];
        this.nutrients = {
            calories: -1,
            fat: -1,
            carbs: -1,
            protein: -1
        }
        this.image = image;
        CsvWriter.registerItem(this);
    }

    convertToCsv() {
        const ingredients = this.ingredients.join('|');
        const data = [
            this.name,
            ingredients,    // TODO: Get this
            this.nutrients.calories,
            this.nutrients.fat,
            this.nutrients.carbs,
            this.nutrients.protein,
            this.image,
        ];
        return data.join(',');
    }
}

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
                    data.map((food) => {
                        const recipe = food.recipe;
                        const name = recipe.label;
                        const image = recipe.image;
                        const calories = recipe.calories;
                        const nutrients = recipe.totalNutrients;
                        const calories = nutrients.ENERC_KCAL.quantity;
                        const fat = nutrients.FAT.quantity;
                        const carbs = nutrients.CHOCDF.quantity;
                        const protein = nutrients.PROCNT.quantity;

                        const food = new FoodModel(name, image);
                        food.nutrients.calories = calories;
                        food.nutrients.fat = fat;
                        food.nutrients.carbs = carbs;
                        food.nutrients.protein = protein;
                    });
                });
        });

    }

    getNutritionSearchUrl() {
        const baseUrl = 'https://api.edamam.com/search';
        const params = {
            q: this.name,
            app_id: process.env.INGREDIENT_APP_ID,
            app_key: process.env.INGREDIENT_APP_KEY,
            to: 1
        };
        const url = `${baseUrl}?${querystring.stringify(params)}`;
        return url;
    }
}

module.exports = {
    Food,
    // FoodModel
};