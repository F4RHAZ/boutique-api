const router = require("express").Router();
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51M2bzfH3Nlh59mjKpcbai3cVFQJaITRzTlV8JKB61OdPCtXcmgaFx7fMyGVvySTqjalmV4ZgNj1a48zsf3WBb7BO00k1CaICnr');
  //


router.post("/payment", (req, res) => {
  stripe.charges.create(
    {
      source: req.body.tokenId,
      amount: req.body.amount,
      currency: "usd",
    },
    (stripeErr, stripeRes) => {
      if (stripeErr) {
        res.status(500).json(stripeErr);
      } else {
        res.status(200).json(stripeRes);
      }
    }
  );
});

module.exports = router;
