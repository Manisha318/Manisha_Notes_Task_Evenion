const express = require('express');
const session = require('express-session');
const app = express();
const mongoose = require('mongoose');
const authRoute = require('./routes/auth');
const notesRoute = require('./routes/notes')
const bodyParser = require('body-parser');
const checkAuth = require('./middlewares/checkAuth')


app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', session({ secret: "$2a$10$NHMKdovhCs9NXSrJUHU3xODKf28vN00qF2Mf/AaBLcj5N8U0B3tu", resave: true, saveUninitialized: true }));


// Routes
app.use('/api/auth', authRoute);
app.use('/api/notes', checkAuth, notesRoute);


// Connect to DB
mongoose
  .connect("mongodb://127.0.0.1:27017/notesDB1")
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log(err);
  });

// Connect server
const port = 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});