const {jsdom} = require('jsdom');

//const Item = require('../models/item');

// Create and return a sample Item object
const buildItemObject = (options = {}) => {
  const title = options.title || 'Sega Toys Homestar Original Planetarium Review'
  const videoUrl = options.videoUrl || 'https://www.youtube.com/watch?v=x1dQh4IWvZ0'  
  const description = options.description || 'Home user review of Sega Toys Homestar Original Planetarium'

  return {title, videoUrl, description};
};

// Add a sample Item object to mongodb
/*
const seedItemToDatabase = async (options = {}) => {
  const item = await Item.create(buildItemObject(options));
  return item;
};
*/

// extract text from an Element by selector.
const parseTextFromHTML = (htmlAsString, selector) => {
  const selectedElement = jsdom(htmlAsString).querySelector(selector);
  if (selectedElement !== null) {
    return selectedElement.textContent;
  } else {
    throw new Error(`No element with selector ${selector} found in HTML string`);
  }
};

const fillCreateVideoFormAndSubmit = (video, page_url) => {
  if(page_url) {
    browser.url(page_url)
  }
  browser.setValue('#txtTitle', video.title)
  browser.setValue('#txtDescription', video.description)
  browser.setValue('#txtVideoUrl', video.videoUrl)
  browser.click('#btnSubmit') 
}

module.exports = {
  buildItemObject,
//  seedItemToDatabase,
  parseTextFromHTML,
  fillCreateVideoFormAndSubmit
};
