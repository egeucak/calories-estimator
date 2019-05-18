require('dotenv').config();

const csvWriter = require('./CsvWriter');
const { Food } = require('./Food');

const apple_pie = new Food('Apple pie');
const baby_back_ribs = new Food('Baby back ribs');
const baklava = new Food('Baklava');

apple_pie.getNutritionInfo();

// csvWriter.write('file.csv');