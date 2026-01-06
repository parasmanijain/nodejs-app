import { join } from 'path';
import express, { urlencoded, static as express_static } from 'express';
import { get404 } from './controllers/error';
import { mongoConnect } from './util/database';

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

import adminRoutes from './routes/admin';
import shopRoutes from './routes/shop';

app.use(urlencoded({ extended: false }));
app.use(express_static(join(__dirname, 'public')));

app.use((req, res, next) => {
  // User.findById(1)
  //   .then(user => {
  //     req.user = user;
  //     next();
  //   })
  //   .catch(err => console.log(err));
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(get404);

mongoConnect(() => {
  app.listen(3000);
});
