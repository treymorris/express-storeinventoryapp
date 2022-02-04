var Product = require('../models/products');
var Category = require('../models/categories');
var async = require('async');
const { body,validationResult } = require('express-validator');

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

// Display list of all products.
exports.product_list = function(req, res, next) {

    Product.find({}, 'name category price')
      .sort({name : 1})
      .populate('category')
      .exec(function (err, list_products) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('product_list', { title: 'Product List', product_list: list_products });
      });
  
  };

// Display detail page for a specific book.
exports.product_detail = function(req, res, next) {

    async.parallel({
        product: function(callback) {

            Product.findById(req.params.id)
              .populate('category')
              .exec(callback);
        },
        
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.product==null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('product_detail', { title: results.product.name, product: results.product } );
    });

};

// Display book create form on GET.
//exports.product_create_get = function(req, res) {
//    res.send('NOT IMPLEMENTED: Book create GET');
//};
exports.product_create_get = function(req, res, next) {

    // Get category, which we can use for adding to our product.
    async.parallel({
        
        category: function(callback) {
            Category.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('product_form', { title: 'Create Product', category: results.category });
    });

};

// Handle book create on POST.
//exports.product_create_post = function(req, res) {
//    res.send('NOT IMPLEMENTED: Book create POST');
//};
exports.product_create_post = [
    

    // Validate and sanitize fields.
    body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('category', 'Category must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('quantityInStock', 'Quantity must not be empty').trim().isLength({ min: 1 }).escape(),
    body('dateUpdated', 'Date must not be empty').trim().isLength({ min: 1 }).escape(),
    

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var product = new Product(
          { name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            quantityInStock: req.body.quantityInStock,
            dateUpdated: req.body.dateUpdated
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.render('product_form', { title: 'Create Product', categories:results.categories, product: product, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid..
            // Check if Genre with same name already exists.
        Product.findOne({ 'name': req.body.name })
        .exec( function(err, found_product) {
           if (err) { return next(err); }

           if (found_product) {
             // Genre exists, redirect to its detail page.
             res.redirect(found_product.url);
           }
           else {

             product.save(function (err) {
               if (err) { return next(err); }
               // Genre saved. Redirect to genre detail page.
               res.redirect(product.url);
             });

           }

         });
    }
  }
];

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