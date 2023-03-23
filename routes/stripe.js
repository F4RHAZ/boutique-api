const router = require("express").Router();
const Stripe = require('stripe');
const express = require("express");
const { Order } = require("../models/Order");

require("dotenv").config();
const stripe = Stripe(process.env.STRIPE_KEY);
//console.log(stripe)
//const stripe = process.env.STRIPE_KEY;


router.post("/create-checkout-session", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  const cartStuff = req.body.cart1.map(item =>{
    return{
      productId: item._id,
      quantity: item.quantity,
      size: item.size,
      inStock: item.inStock,
      color: item.color,
      price: item.price,
    }
  })

//  console.log("dljgld", cartStuff);



  

  const customer = await  stripe.customers.create({
    metadata: {
      userId: req.body.userId,    
      cart: JSON.stringify(cartStuff),
    },
  });

  
  
  const line_items = req.body.cart1.map(item =>{
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
            images: [item.img],
            description: item.desc,
            
            metadata: {
              id: item._id,
              size: item.size,
             color: item.color,
            },
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      };
  });
  
  
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "KE", "SS"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 0,
            currency: "usd",
          },
          display_name: "Free shipping",
          // Delivers between 5-7 business days
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 5,
            },
            maximum: {
              unit: "business_day",
              value: 7,
            },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 1500,
            currency: "usd",
          },
          display_name: "Next day air",
          // Delivers in exactly 1 business day
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 1,
            },
            maximum: {
              unit: "business_day",
              value: 1,
            },
          },
        },
      },
    ],
    phone_number_collection: {
      enabled: true,
    },
    line_items,
    mode: 'payment',
    customer: customer.id,
    // success_url: "https://a-zboutiquefrontend.onrender.com/success",
    // cancel_url:   "https://a-zboutiquefrontend.onrender.com/cart",
   
    success_url: `${process.env.CLIENT_URL}/success`,
    cancel_url:   `${process.env.CLIENT_URL}/cart`
  });
  res.send({url: session.url});
});




// Create order function

const createOrder = async (customer, data) => {
  const Items = JSON.parse(customer.metadata.cart);
  console.log(Items);

  const products = Items.map((item) => {
    return {
      productId: item.productId,
      size: item.size,
      inStock: item.inStock,
      color: item.color,
      price: item.price,
      quantity: item.quantity,
    };
  });
  
//  console.log(" produxtsss ", products);

  //console.log(" DAtAAAAAAAA ", data);
  
  const newOrder = new Order({
    userId: customer.metadata.userId,
    customerId: data.customer,
    paymentIntentId: data.payment_intent,
    products: Items, 
    subtotal: data.amount_subtotal /100,
    total: data.amount_total/ 100,
    shipping: data.customer_details,
    payment_status: data.payment_status,
  });

  try {
    const savedOrder = await newOrder.save();
    console.log("Processed Order:", savedOrder);
  } catch (err) {
    console.log(err);
  }
};




// Stripe webhoook

router.post(
  "/webhook",
  express.raw({type: 'application/json'}),
  async (req, res) => {
    let data;
    let eventType;

    // Check if webhook signing is configured.
    //let webhookSecret;
    //webhookSecret = process.env.STRIPE_WEB_HOOK;
   
    if (webhookSecret) {
      console.log("webhook trial");
     // console.log(webhookRawBody);
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
      let signature = req.headers["stripe-signature"];

      const payload = req.body;
      const payloadString = JSON.stringify(payload, null, 2);
      const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret: process.env.STRIPE_WEB_HOOK,
    });
     try {
      event = stripe.webhooks.constructEvent(payloadString, header, process.env.STRIPE_WEB_HOOK );
        //console.log(`Webhook Verified: `, event);
        } catch (err) {
          console.log(`⚠️  Webhook signature verification failed:  ${err}`);
          return res.sendStatus(400);
        }
        // Extract the object from the event.
        data = event.data.object;
        eventType = event.type;
    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // retrieve the event data directly from the request body.
      data = req.body.data.object;
      eventType = req.body.type;
    }

    // Handle the checkout.session.completed event
    if (eventType === "checkout.session.completed") {
      console.log("done")
      stripe.customers
        .retrieve(data.customer)
        .then(async (customer) => {
          try {
            // CREATE ORDER    
           // console.log("dataaaaaaaaa", data)
            createOrder(customer, data);
          } catch (err) {
            //console.log(typeof createOrder);
            console.log(err);
          }
        })
        .catch((err) => console.log(err.message));
    }

    res.status(200).end();
  }
);



module.exports = router;




////https://a-zboutiquefrontend.onrender.com/api/checkout/webhook