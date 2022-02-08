var express = require('express');
var router = express.Router();

// Require controller modules.
var product_controller = require('../controllers/productController');

var category_controller = require('../controllers/categoryController');


/// Product ROUTES ///

// GET catalog home page.
router.get('/', product_controller.index);

// GET request for creating a product. NOTE This must come before routes that display product (uses id).
router.get('/products/create', product_controller.product_create_get);

// POST request for creating product.
router.post('/products/create', product_controller.product_create_post);

// GET request to delete product.
router.get('/products/:id/delete', product_controller.product_delete_get);

// POST request to delete product.
router.post('/products/:id/delete', product_controller.product_delete_post);

// GET request to update product.
router.get('/products/:id/update', product_controller.product_update_get);

// POST request to update product.
router.post('/products/:id/update', product_controller.product_update_post);

// GET request for one product.
router.get('/products/:id', product_controller.product_detail);

// GET request for list of all product items.
router.get('/products', product_controller.product_list);


/// Category ROUTES ///

// GET request for creating a category. NOTE This must come before route that displays category (uses id).
router.get('/categories/create', category_controller.category_create_get);

//POST request for creating category.
router.post('/categories/create', category_controller.category_create_post);

// GET request to delete category.
router.get('/categories/:id/delete', category_controller.category_delete_get);

// POST request to delete category.
router.post('/categories/:id/delete', category_controller.category_delete_post);

// GET request to update category.
router.get('/categories/:id/update', category_controller.category_update_get);

// POST request to update category.
router.post('/categories/:id/update', category_controller.category_update_post);

// GET request for one category.
router.get('/categories/:id', category_controller.category_detail);

// GET request for list of all category.
router.get('/categories', category_controller.category_list);



module.exports = router;