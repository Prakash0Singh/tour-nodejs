const dotenv = require('dotenv');

dotenv.config();
const app = require('./app');
const mongoConnect = require('./util/database');

const port = process.env.PORT || 3000;

mongoConnect(() => {
    app.listen(port);
});
