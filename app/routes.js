const fetch = require('node-fetch')
module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });


    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
      db.collection('profiles') // finds user by current email
      .find({email:req.user.local.email}).toArray((err, result) => {
        if (err) return console.log(err)

        let stockData = Object.entries(result)
        stockData = Object.entries(stockData[0][1])
        // console.log(stockData.length);

        // if theres anything
        if (stockData.length>2){
          var profile = []
          let total = 0;
          // to skip over the first two entries, id and email.
          for (let i = 2; i <= stockData.length-1; i++ ){
            profile.push({
              'name':stockData[i][0],
              'amount':parseInt(stockData[i][1]),
            })
          }

          res.render('profile.ejs', {
            user : req.user,
            profile:profile
          })
        }
        else{
          let profile = [{email:0}]
          res.render('profile.ejs', {
            user : req.user,
            profile: profile
          })
        }
          //connect users symbol data ????

      })//end of find
    }) //end of put

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

    app.post('/messages', (req, res) => {
      db.collection('messages').save({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })

    app.put('/put', (req, res) => {
      console.log(req.body);

      //looping through the body, using entries ... since i used a template literal as the key, which depends on the stock
      for(const [key,value] of Object.entries (req.body)){
        console.log(`key=> ${key} | value => ${value}`);
      }

      //access each
      const body = Object.entries(req.body);
      console.log(body[0][0]);
      console.log(body[0][1]);
      console.log(body.length);
      db.collection('profiles')
      .findOneAndUpdate({email: req.user.local.email}, { //{name: req.user.local.email}
        $set: {
          [`${body[0][0]}`] : parseInt(body[0][1])
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.put('/messagesDown', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp - 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.delete('/messages', (req, res) => {
      db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};



///////////
// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
