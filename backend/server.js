const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();  
const homeRouter = require('./routes/home');
const dashboardRouter = require('./routes/dashboard');
const forumsRouter = require('./routes/forums');
const eventsRouter = require('./routes/events');
const issuesRouter = require('./routes/issues');
const petitionsRouter = require('./routes/petitions');
const pollsRouter = require('./routes/polls');
const volunteersRouter = require('./routes/volunteers');
const accountsRouter = require('./routes/accounts'); 

const app = express();
const PORT = process.env.PORT || 5000;  

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, 
    { useNewUrlParser: true, useUnifiedTopology: true }
);

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB connection established successfully');
});

connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use('/home', homeRouter);
app.use('/dashboard', dashboardRouter);
app.use('/forums', forumsRouter);
app.use('/events', eventsRouter);
app.use('/issues', issuesRouter);
app.use('/petitions', petitionsRouter);
app.use('/polls', pollsRouter);
app.use('/volunteers', volunteersRouter);
app.use('/accounts', accountsRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
