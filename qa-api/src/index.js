
//import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// ... other require statements ...
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

// define the Express app
const app = express();

// the datatabase
const questions = [];

//enhance your app security with Helmet
app.use(helmet());

// use bodyParser to pare application/json content-type
app.use(bodyParser.json());

// enable all CORS requrests
app.use(cors());

// log HTTP requests
app.use(morgan('combined'));


// retrieve all questions
app.get('/', (req, res) => {
  const qs = questions.map(q => ({
	id: q.id,
	title: q.title,
	description: q.description,
	answers: q.answers.length,
  }));
  res.send(qs);
});

// get a specific question and validate.
app.get('/:id', (req, res) => {
  const question = questions.filter(q => (q.id === parseInt(req.params.id)));
  if (question.length > 1) return res.status(500).send();
  if (question.length === 0) return res.status(404).send();
  res.send(question[0]);
});


const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
	cache: true,
	rateLimit: true,
	jwksRequestsPerMinute: 5,
	jwksUri: `https://zirzow.auth0.com/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: '56goMA3OhHLvYMpJWWZA7iXmZ8Sq8K4x',
  issuer: `https://zirzow.auth0.com/`,
  algorithms: ['RS256']
});

// insert a new question
app.post('/', checkJwt, (req, res) => {
  const {title, description} = req.body;
  const newQuestion = {
	id: questions.length + 1,
	title,
	description,
	answers: [],
	author: req.user.name,
  };
  questions.push(newQuestion);
  res.status(200).send();
});


app.post('/answer/:id', checkJwt, (req, res) => {
  const {answer} = req.body;

  const question = questions.filter(q => (q.id === parseInt(req.params.id)));
  if (question.length > 1) return res.status(500).send();
  if (question.length === 0) return  res.status(404).send();

  question[0].answers.push({
	answer,
	author: req.user.name,
  });

  res.status(200).send();
});

app.listen(8081, () => {
  console.log('listening on port 8081');
});


