var Product = require('../models/products');

var Category = require('../models/categories');


var async = require('async');

exports.index = function(req, res) {

    async.parallel({
        product_count: function(callback) {
            Product.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        category_count: function(callback) {
            Category.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', { title: 'Inventory Home', error: err, data: results });
    });
};

// Display list of all books.
exports.product_list = function(req, res, next) {

    Product.find({}, 'name')
      .sort({name : 1})
      .populate('description category')
      .exec(function (err, list_products) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('product_list', { title: 'Product List', product_list: list_products });
      });
  
  };

// Display detail page for a specific book.
exports.product_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Book detail: ' + req.params.id);
};

// Display book create form on GET.
exports.product_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book create GET');
};

// Handle book create on POST.
exports.product_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book create POST');
};

// Display book delete form on GET.
exports.product_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.product_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.product_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.product_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};