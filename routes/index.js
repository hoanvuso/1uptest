'use strict';

var express = require( 'express' );
var router = express.Router();
var transactionController = require( '../api/transactionsController.js' );
var authController = require( '../api/authController.js' );
var User = require( '../models/user.model.js' );
var jwt = require( 'jsonwebtoken' );
var config = require( '../config' );


/* GET home page. */
/*Save transaction to database*/



router.post( '/authenticate', authController.index );
router.post( '/register', authController.register );

//login
router.get( '/login', function( req, res ) {
  //if valid token, redirect to transaction page
    res.render( 'login', {
        title: 'Login'
    } );
} );

//redirect to login if user GET /, register, authenticate
router.get([
  '/', '',
  '/register',
  '/authenticate'
], function(req, res) {
  res.redirect('/login');
});

router.use( function( req, res, next ) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers[ 'x-access-token' ];
    // decode token
    if ( token ) {
        // verifies secret and checks exp
        jwt.verify( token, config.secret, function( err, decoded ) {
            if ( err ) {
                return res.json( {
                    success: false,
                    message: 'Failed to authenticate token.'
                } );
            }
            else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        } );

    }
    else {

        // if there is no token
        // return an error
        return res.status( 200 ).send( {
            success: false,
            message: 'No token provided.'
        } );
    }
} );


router.post( '/createtransaction', transactionController.createTransaction );

module.exports = router;
