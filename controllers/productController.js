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

    Product.find({}, 'name category')
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
        res.render('product_detail', { title: 'Product', product: results.product } );
    });

};

// Display Product create form on GET.
exports.product_create_get = function(req, res, next) {

    // Get all authors and genres, which we can use for adding to our book.
    async.parallel({
        
        categories: function(callback) {
            Category.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('product_form', { title: 'Create Product', categories: results.categories });
    });

};
    

// Handle Product create on POST.
//exports.product_create_post = function(req, res) {
//    res.send('NOT IMPLEMENTED: Book create POST');
//};
exports.product_create_post =  [

        // Validate and sanitize the name field.
        body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
        body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
        body('quantityInStock', 'Quantity must not be empty').escape(),
        body('dateUpdated', 'Date must not be empty').escape(),
        body('category', 'Category must not be empty').escape(),
      
        // Process request after validation and sanitization.
        (req, res, next) => {
      
          // Extract the validation errors from a request.
          const errors = validationResult(req);
      
          // Create a genre object with escaped and trimmed data.
          var product = new Product(
            {
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                price: req.body.price,
                quantityInStock: req.body.quantity,
                dateUpdated: req.body.date
            }
          );
      
          if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('product_form', { title: 'Create Product', product: product, errors: errors.array()});
            return;
          }
          else {
            // Data from form is valid.
            // Check if Category with same name already exists.
            Product.findOne({ 'name': req.body.name })
              .exec( function(err, found_product) {
                 if (err) { return next(err); }
      
                 if (found_product) {
                   // Category exists, redirect to its detail page.
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
// Display Product delete form on GET.
//exports.product_delete_get = function(req, res) {
//    res.send('NOT IMPLEMENTED: Book delete GET');
//};
exports.product_delete_get = function(req, res, next) {

    Product.findById(req.params.id)
    //.populate('book')
    .exec(function (err, product) {
        if (err) { return next(err); }
        if (product==null) { // No results.
            res.redirect('/inventory/products');
        }
        // Successful, so render.
        res.render('product_delete', { title: 'Delete Product', product:  product});
    })

};

// Handle Product delete on POST.
//exports.product_delete_post = function(req, res) {
//    res.send('NOT IMPLEMENTED: Book delete POST');
//};
exports.product_delete_post = function(req, res, next) {
    
    // Assume valid Product id in field.
    Product.findByIdAndRemove(req.params.id, function deleteProduct(err) {
        if (err) { return next(err); }
        // Success, so redirect to list of Products.
        res.redirect('/inventory/products');
        });

};

// Display book update form on GET.
// exports.product_update_get = function(req, res) {
//     res.send('NOT IMPLEMENTED: Book update GET');
// };
exports.product_update_get = function(req, res, next) {

    // Get book, authors and genres for form.
    async.parallel({
        product: function(callback) {
            Product.findById(req.params.id).populate('category').exec(callback);
        },
        categories: function(callback) {
            Category.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.product==null) { // No results.
                var err = new Error('Product not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected genres as checked.
            for (var all_g_iter = 0; all_g_iter < results.categories.length; all_g_iter++) {
                for (var product_g_iter = 0; product_g_iter < results.product.category.length; product_g_iter++) {
                    if (results.categories[all_g_iter]._id.toString()===results.product.category[product_g_iter]._id.toString()) {
                        results.categories[all_g_iter].checked='true';
                    }
                }
            }
            res.render('product_form', { title: 'Update Product', categories: results.categories, product: results.product });
        });

};

// Handle book update on POST.
// exports.product_update_post = function(req, res) {
//     res.send('NOT IMPLEMENTED: Book update POST');
// };
exports.product_update_post = [
   
    // Validate and sanitze the name field.
    body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('quantityInStock', 'Quantity must not be empty').escape(),
    body('dateUpdated', 'Date must not be empty').escape(),
    body('category', 'Category must not be empty').escape(),
    
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
        // Extract the validation errors from a request .
        const errors = validationResult(req);
  
    // Create a genre object with escaped and trimmed data (and the old id!)
        var product = new Product(
          {
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            quantityInStock: req.body.quantity,
            dateUpdated: req.body.date,
            _id: req.params.id
          }
        );
  
  
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('product_form', { title: 'Update Product', product: product, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid. Update the record.
            Product.findByIdAndUpdate(req.params.id, product, {}, function (err,theproduct) {
                if (err) { return next(err); }
                   // Successful - redirect to genre detail page.
                   res.redirect(theproduct.url);
                });
        }
    }
  ];