'use strict';

/*global Stripe:true*/
/*global $form:true*/

//set Public key for Stripe payments
var isSubmit = false;
$(document).ready(function () {
//  $('#submittransaction').click(function () {
//    console.log('ok');
//    if (!isSubmit) {
//      Stripe.card.createToken({
//        number: $('.card-number').val(),
//        cvc: $('.card-cvc').val(),
//        exp_month: $('.card-expiry-month').val(),
//        exp_year: $('.card-expiry-year').val()
//      }, function (status, response) {
//        if (response.error) {
//          // Show the errors on the form
//          $('.payment-errors').text(response.error.message);
//        }
//        else {
//          // response contains id and card, which contains additional card details
//          var token = response.id;
//          // Insert the token into the form so it gets submitted to the server
//          $form.append($('<input type="hidden" name="stripeToken" />').val(token));
//          // and submit
//          $.ajax({
//            url: '/createtransaction',
//            type: 'POST',
//            headers: {
//              'x-access-token': $('#token').html()
//            },
//            data: {
//              amount: $('#amount').val(),
//              currency: $('#currency').val(),
//              token: token
//            }
//          }).done(function (response) {
//            if (response.message) {
//              $('.payment-errors').text(response.message);
//            }
//          });
//        }
//
//      });
//    }
//
//  });

  //login form
  $('#login-form-link').click(function (e) {
    $("#login-form").delay(100).fadeIn(100);
    $("#register-form").fadeOut(100);
    $('#register-form-link').removeClass('active');
    $(this).addClass('active');
    e.preventDefault();
  });
  $('#register-form-link').click(function (e) {
    $("#register-form").delay(100).fadeIn(100);
    $("#login-form").fadeOut(100);
    $('#login-form-link').removeClass('active');
    $(this).addClass('active');
    e.preventDefault();
  });

  var $form = $('#payment-form');
  $form.on('submit', payWithStripe);

  /* If you're using Stripe for payments */
  function payWithStripe(e) {
    e.preventDefault();

    /* Visual feedback */
    $form.find('[type=submit]').html('Validating <i class="fa fa-spinner fa-pulse"></i>');

    var PublishableKey = 'pk_test_Z3rf3HSfsokHl4lLFTBxhZrZ'; // Replace with your API publishable key
    Stripe.setPublishableKey(PublishableKey);
    Stripe.card.createToken($form, function stripeResponseHandler(status, response) {
      console.log(response);
      if (response.error) {
        /* Visual feedback */
        $form.find('[type=submit]').html('Try again');
        /* Show Stripe errors on the form */
        $form.find('.payment-errors').text(response.error.message);
        $form.find('.payment-errors').closest('.row').show();
      } else {
        /* Visual feedback */
        $form.find('[type=submit]').html('Processing <i class="fa fa-spinner fa-pulse"></i>');
        /* Hide Stripe errors on the form */
        $form.find('.payment-errors').closest('.row').hide();
        $form.find('.payment-errors').text("");
        // response contains id and card, which contains additional card details
        var token = response.id;
        console.log(token);
        // AJAX
        $.post('/account/stripe_card_token', {
          token: token
        })
        // Assign handlers immediately after making the request,
        .done(function (data, textStatus, jqXHR) {
          $form.find('[type=submit]').html('Payment successful <i class="fa fa-check"></i>').prop('disabled', true);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          $form.find('[type=submit]').html('There was a problem').removeClass('success').addClass('error');
          /* Show Stripe errors on the form */
          $form.find('.payment-errors').text('Try refreshing the page and trying again.');
          $form.find('.payment-errors').closest('.row').show();
        });
      }
    });
  }

  /* Form validation */
  jQuery.validator.addMethod("month", function (value, element) {
    return this.optional(element) || /^(01|02|03|04|05|06|07|08|09|10|11|12)$/.test(value);
  }, "Please specify a valid 2-digit month.");

  jQuery.validator.addMethod("year", function (value, element) {
    return this.optional(element) || /^[0-9]{2}$/.test(value);
  }, "Please specify a valid 2-digit year.");

  var validator = $form.validate({
    rules: {
      cardNumber: {
        required: true,
        creditcard: true,
        digits: true
      },
      expMonth: {
        required: true,
        month: true
      },
      expYear: {
        required: true,
        year: true
      },
      cvCode: {
        required: true,
        digits: true
      }
    },
    highlight: function (element) {
      $(element).closest('.form-control').removeClass('success').addClass('error');
    },
    unhighlight: function (element) {
      $(element).closest('.form-control').removeClass('error').addClass('success');
    },
    errorPlacement: function (error, element) {
      $(element).closest('.form-group').append(error);
    }
  });

  var paymentFormReady = function () {
    if ($form.find('[name=cardNumber]').hasClass("success") &&
            $form.find('[name=expMonth]').hasClass("success") &&
            $form.find('[name=expYear]').hasClass("success") &&
            $form.find('[name=cvCode]').val().length > 1) {
      return true;
    } else {
      return false;
    }
  };

  $form.find('[type=submit]').prop('disabled', true);
  var readyInterval = setInterval(function () {
    if (paymentFormReady()) {
      $form.find('[type=submit]').prop('disabled', false);
      clearInterval(readyInterval);
    }
  }, 250);
});
