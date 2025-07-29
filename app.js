// This is a simple Express.js application that serves a "Hello, World!" message.
const express = require('express');
const app = express();
const mongoose = require('mongoose'); // Import mongoose for MongoDB interactions
const morgan = require('morgan'); // Import morgan for logging HTTP requests
const bodyParser = require('body-parser'); // Import body-parser to handle JSON requests
const cors = require('cors'); // Import cors for enabling Cross-Origin Resource Sharing
require('dotenv/config'); // Load environment variables from .env file
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')
const { swaggerUi, specs } = require('./swagger');


app.use(cors());
app.options('*', cors())

//middlewares
app.use(bodyParser.json()); // Middleware to parse JSON bodies
app.use(morgan('tiny')); // Middleware to log HTTP requests in development mode
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// routers
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');

const api = process.env.API_URL;
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.CONNECT_STRING,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'eshop-database' // Specify the database name
    }
)
.then(() => {
    console.log('Connected to MongoDB');
}
).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});



app.listen(3000, () => {
    console.log(`API URL: ${api}`); // Log the API URL from environment variables
    console.log('Server is running on port 3000');
})