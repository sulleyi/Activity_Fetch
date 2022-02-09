import Koa = require('koa');
import Router = require('@koa/router');
import cors = require('@koa/cors');
import render = require('koa-ejs');
import path = require('path');
import bodyParser = require('koa-bodyparser')

// Commented out so it doesn't get auto-removed by text editors. You may uncomment if needed.
import fetch = require('isomorphic-fetch');

// Used for reading incoming POST bodies. Commented out for same reason as above.
// See https://github.com/dlau/koa-body#usage-with-koa-router
// import koaBody from 'koa-body';

const app = new Koa();
const router = new Router();
const port = 3070;

const ACTIVITY_API = 'https://www.boredapi.com/api/activity/';

let assets = {
	img_url: "https://images.dog.ceo/breeds/otterhound/n02091635_2084.jpg",
	activity: ""
}

//Koa Body Parser
app.use(bodyParser());

//Setup EJS Render
render(app, {
	root: path.join(__dirname,'views'),
	layout: 'layout',
	viewExt: 'html',
	cache: false,
	debug: false
})

app.use(cors({origin: '*'}));


// Routes
router.get('/', index);
router.get('/breed', showBreed);
router.post('/breed', searchBreed);

app.use(async (ctx, next) => {
	await next();
	const rt = ctx.response.get('X-Response-Time');
	console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

app.use(async (ctx, next) => {
	const start = Date.now();
	await next();
	const ms = Date.now() - start;
	ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(router.routes());

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});


//Render Index
async function index(ctx) {
	
	let activity_data = await loadJson(ACTIVITY_API);
	assets.activity = activity_data.activity;
	await ctx.render('index' , assets );
}


//Render Breed 
async function showBreed(ctx) {

 	await ctx.render('breed');
 }

 //Query API for Dog Breed 
 async function searchBreed(ctx) {

	let body = ctx.request.body;
	let breed = body.breed;
	let url = `https://dog.ceo/api/breed/${breed}/images/random`;
	let dog_data = await loadJson(url);
	let img_url = dog_data.message;
	assets.img_url = img_url;
	ctx.redirect('/');
 }

 //Fetch Wrappera
 async function loadJson(api_url: string) {
	try {
		let response = await fetch(api_url);
		return await response.json();
	} catch(error) {
		console.log(error);
	}
}