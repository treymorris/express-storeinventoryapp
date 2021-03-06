var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProductSchema = new Schema(
  {
    name: {type: String, required: true},
    description: {type: String, required: true},
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    price: {type: Number, required: true},
    quantityInStock: { type: Number, required: true},
    dateUpdated: {type: Date},
  }
);

// Virtual for product's URL
ProductSchema
.virtual('url')
.get(function () {
  return '/inventory/products/' + this._id;
});

//Export model
module.exports = mongoose.model('Product', ProductSchema);