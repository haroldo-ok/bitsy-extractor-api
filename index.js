const 
	express = require("express"),
	rateLimit = require("express-rate-limit"),
	helmet = require("helmet"),
	xss = require("xss-clean"),
	hpp = require("hpp"),
	cors = require("cors"),
	fetch = require("node-fetch");
	
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

// Main API call
app.get("/api/v1/*", async function(req, res) {
	const remoteURL = `http://${req.params[0]}`;
	
	try {
		const response = await fetch(remoteURL);
		const responseText = await response.text();

		res.setHeader('Content-Type', 'text/plain');
		res.send(responseText);
	} catch (e) {
		console.error(`Error when accessing ${remoteURL}`, e);
		res.status(500);
		res.send(e.message);
	}
});

app.get("*", function(req, res) {
	res.status(404);
	res.send("Invalid API URL");
});

app.listen(port, function(err) {
     console.log("running server on from port:::::::" + port);
});