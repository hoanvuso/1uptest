'use strict';

var Transactions = require( '../models/transactions.model.js' );
var User = require( '../models/user.model.js' );
var config = require( '../config' );
var Stripe = require( 'stripe' )( config.stripeApiKey );

exports.index = function( req, res, next ) {
    if ( req.body ) {
        var transaction = new Transactions( {
            name: req.body.name
        } );
        transaction.save( function( err, trans ) {
            if ( err ) {
                return console.log( err );
            }
            res.status( 200 ).end();
        } );
    }
};

exports.createTransaction = function( req, res, next ) {
  //store token to user if user provided
  //otherwise check token from db
  //find user in the DB
  User.findOne({_id: req.decoded._id}).exec(function(err, user) {
    if (err) { return res.status(500).json({ message: 'Don\'t know error, please try again!' }); }
    if (!user) { return res.status(404).json({ message: 'Invalid user!' }); }
    
    //check stripe token
    var token = req.body.stripeToken || user.stripeToken;
    if (!token){ return res.status(422).json({ message: 'Missing stripe token!' }); }
    
    //do transaction
    Stripe.charges.create( {
      //minimum charge
      //TODO - check base on currency, need to check stripe rules
      amount: req.body.amount * 100,
      currency: req.body.currency,
      source: req.body.stripeToken,
      description: 'Charge for test@example.com'
    }, function( err, charge ) {
      if (err) { return res.status(400).json(err); }
      
      var transaction = new Transactions({
        transactionId: charge.id,
        amount: charge.amount,
        created: charge.created,
        currency: charge.currency,
        description: charge.description,
        paid: charge.paid,
        sourceId: charge.source.id
      });
      
      transaction.save( function( err ) {
        if (err) { return res.status(500).json(err); }
        
        //store token to user if they are different
        if (req.body.stripeToken && user.stripeToken !== req.body.stripeToken) {
          user.stripeToken = req.body.stripeToken;
          user.save();
        }
        
        res.status(200).json({ message: 'Payment is created.' });
      });
      // asynchronously called
    });
  });
};
