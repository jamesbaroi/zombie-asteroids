import express from 'express';

export const routerMain = express.Router();

// Index
routerMain.use('/', (req, res) => {
  res.render('index', { title: 'Zombie Asteroids' });
});


// Redirect
routerMain.all('*', (req, res) => { res.redirect('/'); });