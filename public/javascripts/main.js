'use strict';

/*global Stripe:true*/
/*global $form:true*/

//set Public key for Stripe payments
Stripe.setPublishableKey( 'pk_test_6pRNASCoBOKtIshFeQd4XMUh' );
var isSubmit = false;
$( document ).ready( function() {
    $( '#submittransaction' ).click( function() {
        console.log( 'ok' );
        if ( !isSubmit ) {
            Stripe.card.createToken( {
                number: $( '.card-number' ).val(),
                cvc: $( '.card-cvc' ).val(),
                exp_month: $( '.card-expiry-month' ).val(),
                exp_year: $( '.card-expiry-year' ).val()
            }, function( status, response ) {
                if ( response.error ) {
                    // Show the errors on the form
                    $( '.payment-errors' ).text( response.error.message );
                }
                else {
                    // response contains id and card, which contains additional card details
                    var token = response.id;
                    // Insert the token into the form so it gets submitted to the server
                    $form.append( $( '<input type="hidden" name="stripeToken" />' ).val( token ) );
                    // and submit
                    $.ajax( {
                        url: '/createtransaction',
                        type: 'POST',
                        headers: {
                            'x-access-token': $( '#token' ).html()
                        },
                        data: {
                            amount: $( '#amount' ).val(),
                            currency: $( '#currency' ).val(),
                            token: token
                        }
                    } ).done( function( response ) {
                        if ( response.message ) {
                            $( '.payment-errors' ).text( response.message );
                        }
                    } );
                }

            } );
        }

    } );
    
    //login form
    $('#login-form-link').click(function(e) {
		$("#login-form").delay(100).fadeIn(100);
 		$("#register-form").fadeOut(100);
		$('#register-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});
	$('#register-form-link').click(function(e) {
		$("#register-form").delay(100).fadeIn(100);
 		$("#login-form").fadeOut(100);
		$('#login-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});
} );
