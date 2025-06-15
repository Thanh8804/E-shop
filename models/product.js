const mongoose = require('mongoose'); // Import mongoose for MongoDB interactions
// In mongoose, models is collections on MongoDB cloud and also table in SQL databases
// schema maps to a collection in the database


const productSchema = mongoose.Schema({
    name: String,
    image: String,
    countInStock: {
        type: Number,
        required: true,
    }
});
exports.Product = mongoose.model('Product', productSchema); // Create a Mongoose model for the Product schema
