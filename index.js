const 
	express = require("express"),
	rateLimit = require("express-rate-limit"),
	helmet = require("helmet"),
	xss = require("xss-clean"),
	hpp = require("hpp"),
	cors = require("cors"),
	fetch = require("node-fetch"),
	cheerio = require("cheerio");
	
const 
	app = express(),
	port = process.env.PORT || 3070;

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


// Functions


const fetchText = async (url) => {
	try {
		const response = await fetch(url);
		const responseText = await response.text();
		return responseText;
	} catch (e) {
		const msg = `Error fetching URL "${url}": ${e.message}`;
		console.warn(msg, e);
		throw new Error(msg);
	}
};

const extractIframeSrc = $ => { 
	const iframe = $('.game_frame [data-iframe]').attr('data-iframe')
	const $iframe = cheerio.load(iframe);
	return $iframe('iframe').attr('src');
}

const extractBitsyText = $ => {
	const $bitsyScript = $('script[type="text/bitsyGameData"]');
	return $bitsyScript.html().replace(/^\n/, '');	
}

// Main API route
app.get("/api/v1/*", async function(req, res) {
	const remoteURL = `http://${req.params[0]}`;
	let accessedURL;
	
	try {
		const mainPage = await fetchText(remoteURL);
		
		const $ = cheerio.load(mainPage);
		const src = extractIframeSrc($);
		
		let scriptText;
		
		if (src) {
			const gameURL = `http:${src}`;
			const gamePage = await fetchText(gameURL);

			const $game = cheerio.load(gamePage);
			scriptText = extractBitsyText($game);
		} else {
			// FIXME: Causes the error "Cannot read property 'parent' of undefined"
			scriptText = extractBitsyText($);	
		}
		
		if (!scriptText) {
			throw new Error('Bitsy script not found.');
		}
		
		res.setHeader('Content-Type', 'text/plain');
		res.send(scriptText);
	} catch (e) {
		console.error(e);
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