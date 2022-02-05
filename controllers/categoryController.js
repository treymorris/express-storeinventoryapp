var Category = require('../models/categories');
var Product = require('../models/products');
var async = require('async');
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.category_list = function(req, res, next) {

    Category.find({}, 'name')
      .sort({title : 1})
      .exec(function (err, list_categories) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('category_list', { title: 'Category List', category_list: list_categories });
      });
  
  };

// Display detail page for a specific Genre.
exports.category_detail = function(req, res, next) {

    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id)
              .exec(callback);
        },

        category_products: function(callback) {
            Product.find({ 'category': req.params.id })
            //Product.findById(req.params.id)
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('category_detail', { title: 'Category Detail', category: results.category, category_products: results.category_products } );
    });

};

// Display Genre create form on GET.
 exports.category_create_get = function(req, res, next) {
     res.render('category_form', { title: 'Create Category' });
   };

// Display Genre create form on GET.
//exports.category_create_get = function(req, res) {
//   res.send('NOT IMPLEMENTED: Genre create GET');
//};

// Handle Genre create on POST.
exports.category_create_post =  [

    // Validate and sanitize the name field.
    body('category', 'Category name required').trim().isLength({ min: 1 }).escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a genre object with escaped and trimmed data.
      var category = new Category(
        { name: req.body.name }
      );
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('category_form', { title: 'Create Category', category: category, errors: errors.array()});
        return;
      }
      else {
        // Data from form is valid.
        // Check if Genre with same name already exists.
        Category.findOne({ 'name': req.body.name })
          .exec( function(err, found_category) {
             if (err) { return next(err); }
  
             if (found_category) {
               // Genre exists, redirect to its detail page.
               res.redirect(found_category.url);
             }
             else {
  
               category.save(function (err) {
                 if (err) { return next(err); }
                 // Genre saved. Redirect to genre detail page.
                 res.redirect(category.url);
               });
  
             }
  
           });
      }
    }
  ];
// Handle Genre create on POST.
//exports.category_create_post = function(req, res) {
//    res.send('NOT IMPLEMENTED: Genre create POST');
//};

// Display Genre delete form on GET.
//exports.category_delete_get = function(req, res) {
//    res.send('NOT IMPLEMENTED: Genre delete GET');
//};
exports.category_delete_get = function(req, res, next) {

    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        },
        category_products: function(callback) {
            Product.find({ 'category': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            res.redirect('/inventory/categories');
        }
        // Successful, so render.
        res.render('category_delete', { title: 'Delete Category', category: results.category, category_products: results.category_products } );
    });

};

// Handle Genre delete on POST.
//exports.category_delete_post = function(req, res) {
//    res.send('NOT IMPLEMENTED: Genre delete POST');
//};
exports.category_delete_post = function(req, res, next) {

    async.parallel({
        category: function(callback) {
          Category.findById(req.body.categoryid).exec(callback)
        },
        categories_products: function(callback) {
          Product.find({ 'category': req.body.categoryid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.categories_books.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('category_delete', { title: 'Delete Category', category: results.category, category_books: results.categories_products } );
            return;
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Category.findByIdAndRemove(req.body.categoryid, function deleteCategory(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/inventory/categories')
            })
        }
    });
};

// Display Genre update form on GET.
//exports.category_update_get = function(req, res) {
//    res.send('NOT IMPLEMENTED: Genre update GET');
//};
exports.category_update_get = function(req, res, next) {

  Category.findById(req.params.id, function(err, category) {
      if (err) { return next(err); }
      if (category==null) { // No results.
          var err = new Error('Category not found');
          err.status = 404;
          return next(err);
      }
      // Success.
      res.render('category_form', { title: 'Update Category', category: category });
  });

};

// Handle Genre update on POST.
//exports.category_update_post = function(req, res) {
//    res.send('NOT IMPLEMENTED: Genre update POST');
//};
exports.category_update_post = [
   
  // Validate and sanitze the name field.
  body('name', 'Category name must contain at least 3 characters').trim().isLength({ min: 3 }).escape(),
  

  // Process request after validation and sanitization.
  (req, res, next) => {

      // Extract the validation errors from a request .
      const errors = validationResult(req);

  // Create a genre object with escaped and trimmed data (and the old id!)
      var category = new Category(
        {
        name: req.body.name,
        _id: req.params.id
        }
      );


      if (!errors.isEmpty()) {
          // There are errors. Render the form again with sanitized values and error messages.
          res.render('category_form', { title: 'Update Category', category: category, errors: errors.array()});
      return;
      }
      else {
          // Data from form is valid. Update the record.
          Category.findByIdAndUpdate(req.params.id, category, {}, function (err,thecategory) {
              if (err) { return next(err); }
                 // Successful - redirect to genre detail page.
                 res.redirect(thecategory.url);
              });
      }
  }
];