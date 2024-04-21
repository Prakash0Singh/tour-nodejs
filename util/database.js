const mongoose = require('mongoose');
const { ServerApiVersion } = require('mongodb');

const mongoURI = '';


const mongoConnect = callback => {

  mongoose.connect(mongoURI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  })
    .then(() => {
      console.log('Connected to MongoDB');
      callback();
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB:', error.message);

      if (error.name === 'MongoNetworkError') {
        console.error('Network error occurred. Check your MongoDB server.');
      } else if (error.name === 'MongooseServerSelectionError') {
        console.error('Server selection error. Ensure'
          + ' MongoDB is running and accessible.');
      } else {
        console.error('An unexpected error occurred:', error);
      }
    });
}

module.exports = mongoConnect;