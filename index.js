const 
	express = require("express"),
	rateLimit = require("express-rate-limit"),
	helmet = require("helmet"),
	xss = require("xss-clean"),
	hpp = require("hpp"),
	cors = require("cors");
	
const 
	app = express(),
	port = 3070;

// Allows cross-origin requests
app.use(cors());

// Sets HTTP security headers
app.use(helmet());

// Limits amount of requests for the same API
const limiter = rateLimit({
  max: 1500,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP; please, try again in one hour."
});
app.use("/api", limiter);

// Scrubs data against XSS (removes malicious HTML code sent by the user)
app.use(xss());

// Prevents parameter pollution.
app.use(hpp());

app.get("/", function(req, res) {
	res.send("App works!!");
});

app.get("*", function(req, res) {
	res.status(404);
	res.send("Invalid API URL");
});

app.listen(port, function(err) {
     console.log("running server on from port:::::::" + port);
});