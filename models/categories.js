var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema(
  {
    name: {type: String, required: true, minlength: 3, maxlength: 20},
    
  }
);

// Virtual for book's URL
CategorySchema
.virtual('url')
.get(function () {
  return '/inventory/categories/' + this._id;
});

//Export model
module.exports = mongoose.model('Category', CategorySchema);