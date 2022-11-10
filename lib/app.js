const express = require('express');
const app = express();
const path = require('path');
const interests = require('./interests.js');

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));
app.use('/api/interests', interests);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/../public/html/HomePage.html'));
});

app.get('/homepage', (req, res) => {
    res.sendFile(path.join(__dirname+'/../public/html/HomePage.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname+'/../public/html/Login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname+'/../public/html/Register.html'));
});

app.get('/contacts', (req, res) => {
    res.sendFile(path.join(__dirname+'/../public/html/ContactUs.html'));
});

app.get('/loggedUser', (req, res) => {
    res.sendFile(path.join(__dirname+'/../public/html/LoggedUser.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname+'/../public/html/admin.html'));
});


/* Moduli per la gestione delle richieste alle API */
const users = require('./users.js');
app.use('/api/users', users);

const chats = require('./chats.js');
app.use('/api/chats', chats);

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});

module.exports = app;
