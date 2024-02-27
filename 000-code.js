// Require the express web application framework (https://expressjs.com)
var express = require("express");

// Create a new web application by calling the express function
var app = express();

// Specify URL encoding as extended true
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get port from environment and store in Express.
var port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

// Dictionaries of cost of each item
var pizzaTypeDict = {
  "Cheese Pizza": 12.55,
  "Veggie Pizza": 12.75,
  "Marinara Pizza": 15.55,
  "Super Supreme": 16.25,
  "Tropical Pizza": 11.75,
  "Veggie Supreme": 13.75,
};

var pizzaSizeDict = {
  "Small": 0.0,
  "Medium": 1.5,
  "Large": 2.0,
  "Extra Large": 3.5,
};

var optionsDict = {
  0: 0.0,
  1: 0.5,
  2: 1.0,
  3: 1.5,
  4: 2.0,
};

var promotionDict = {
  7342418: ["Dinner-4-All", 0.1],
  8403979: ["Winter-Special", 0.25],
  2504647: ["Midweek-Deal", 0.5],
  8406800: ["Special  Gift", 0.75],
  0: ["Invalid Code", 0.0],
};

app.post("/order", function (req, res) {
  function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  }

  function formatAM_PM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + ":" + seconds + " " + ampm;
    return strTime;
  }

  let optionsNum;
  let date = new Date();
  let promoCode = req.body.promocode;
  let numBoxes = parseInt(req.body.numBoxes);
  let pizzaSize = req.body.pizzaSize;
  let pizzaType = req.body.pizzaType;
  let pizzaOptions = req.body.pizzaOptions;

  //sorting no pizzaOptions
  if (pizzaOptions == undefined) {
    pizzaOptions = "none";
  }

  if (pizzaOptions == "none") {
    optionsNum = 0;
  } else if (pizzaOptions.length > 4) {
    optionsNum = 1;
  } else {
    optionsNum = pizzaOptions.length;
  }

  // calculate cost of pizza
  let cost = (
    numBoxes * (pizzaTypeDict[pizzaType] + pizzaSizeDict[pizzaSize]) +
    optionsDict[optionsNum]
  ).toFixed(2);

  // Sorting Promocodes from invalid entry
  if (
    promotionDict[promoCode] == undefined ||
    promotionDict[promoCode] == NaN
  ) {
    promoCode = 0;
  }
  //Promocode discount
  let promoDiscount = (promotionDict[promoCode][1] * cost).toFixed(2);

  let name = req.body.firstname + " " + req.body.surname;
  let address =
    req.body.address +
    ", " +
    req.body.city +
    ", " +
    req.body.state +
    ", " +
    req.body.postcode;
  let mobile = req.body.mobile;
  let email = req.body.email;

  let mm = date.getMonth() + 1; // Months start at 0!
  let dd = date.getDate();
  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;
  const formattedToday = dd + "/" + mm + "/" + date.getFullYear();

  let deliveryTime = addMinutes(date, 45);

  let html = `<div class="container">
  <h1>Thank you for ordering with us</h1>
  <p>Thank you for your order received on: <b>${date.toTimeString()}</b><br></p>
  <h2>Pizza Details</h2>
  <p>
  <ul>
  <li>
${numBoxes} x ${pizzaSize} ${pizzaType} [Options: ${pizzaOptions}]
  </li>
  </ul></p>
  <h2>Customer Details</h2>
  <p><ul><li>Customer: ${name}</li>
  <li>Address: ${address}</li>
  <li>Contact mobile: ${mobile}</li>
  <li>Contact email: ${email}</li></ul></p>
  <h2>Pizza Cost</h2>
  <p>The total cost of your pizza is:<br/></p>
  <table border="1">
    <tr>
      <td width="75%">
        Pizza(s): ${numBoxes} x ${pizzaType} (${pizzaSize}, ${optionsNum} options)
      </td>
      <td width="25%">$${cost}</td>
    </tr>
    <tr>
      <td>Delivery:</td>
      <td>$5.00</td>
    </tr>
    <tr>
      <td>Promotion code (${promotionDict[promoCode][0]}, -${Math.round(
    promotionDict[promoCode][1] * 100
  ).toFixed(2)}%)</td>
      <td>$-${promoDiscount}</td>
    </tr>
    <tr>
    <th>Total</th>
    <th>$${(cost + 5.0 - promoDiscount)}</th>
    </tr>

  </table>

  <h2>Estimated Delivery Time</h2>
  <p>Delivery expected by <b>${formatAM_PM(
    deliveryTime
  )} </b>(${formattedToday}) -- or the pizza is free!<br><br>To return to the previous page to order another pizza, please click here <a href="/order.html">RETURN</a></p></div>`;
  res.send(html);
});

// Tell our application to serve all the files under the `public_html` directory
app.use(express.static("public_html"));

// Tell our application to listen to requests at port 3000 on the localhost
app.listen(port, function () {
  // When the application starts, print to the console that our app is
  // running at http://localhost:3000  (where the port number is 3000 by
  // default). Print another message indicating how to shut the server down.
  console.log(`Web server running at: http://localhost:${port}`);
  console.log("Type Ctrl+C to shut down the web server");
});
