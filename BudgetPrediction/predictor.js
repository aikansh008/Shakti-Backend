// predictors.js
const {predictDairyBudget} = require('../Models/Budget/dairybudget');
const {predictlaundryBudget} = require('../Models/Budget/laundary');
const { predictrestaurantBudget } = require('../Models/Budget/restaurant')
const { predictretailBudget} = require('../Models/Budget/retailbudget');
const { predicttravelBudget} = require('../Models/Budget/travel');
const {predicthealthBudget} = require('../Models/Budget/healthcare');
const { predictbeautyBudget} =  require('../Models/Budget/beauty');
const { predictmanufacturingBudget} = require('../Models/Budget/manufacturing')
// add other sectors...

const predictors = {
  dairy: predictDairyBudget,
  laundry: predictlaundryBudget, // add more as needed
  restaurant: predictrestaurantBudget,
  retail: predictretailBudget,
  travel: predicttravelBudget,
  healthcare: predicthealthBudget,
  beauty: predictbeautyBudget,
  manufacturing: predictmanufacturingBudget,
};

module.exports = predictors;
