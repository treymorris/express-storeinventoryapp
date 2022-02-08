#! /usr/bin/env node

console.log('This script populates some test info to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Product = require('./models/products')
var Category = require('./models/categories')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var products = []
var categories = []

function categoryCreate(name, cb) {
  var category = new Category({ name: name });
       
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category);
  }   );
}

function productCreate(name, description, price, quantityInStock, dateUpdated, category, cb) {
  productdetail = { 
    name: name,
    description: description,
    price: price,
    quantityInStock: quantityInStock,
    dateUpdated: dateUpdated,
  }
  if (category != false) productdetail.category = category
    
  var product = new Product(productdetail);    
  product.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Product: ' + product);
    products.push(product)
    cb(null, product)
  }  );
}

function createCategories(cb) {
    async.series([
        function(callback) {
          categoryCreate("dry goods", callback);
        },
        function(callback) {
          categoryCreate("produce", callback);
        },
        function(callback) {
          categoryCreate("cheese", callback);
        },
        ],
        // optional callback
        cb);
}

function createProducts(cb) {
    async.parallel([
        function(callback) {
          productCreate('spaghetti', 'pasta', 10, 4, new Date(), categories[0], callback);
        },
        function(callback) {
          productCreate('romaine', 'lettuce', 5, 2, new Date(), categories[1], callback);
        },
        function(callback) {
          productCreate('parmesan', '10 lb wheel', 15, 1, new Date(), [categories[2], callback);
        },
        ],
        // optional callback
        cb);
}






async.series([
    createCategories,
    createProducts
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('BOOKInstances: '+ products);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});
