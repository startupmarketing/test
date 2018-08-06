const express = require('express');
const axios = require('axios');
const requestPromise = require('request-promise');
const router = express.Router();
const Question = require('../models/question');
const mongoose = require('mongoose');

var qs = require('querystring');



//<-----------------------Testing req/res----------------------->
router.get('', (req, res, next) => {
	res.status(200).json({
		message: 'Get request handled!'
	});
});

router.post('', (req, res, next) => {
	res.status(200).json({
		message: 'Post request handled!'
	});
});

//<-----------------------Testing IMAGES API req/res----------------------->
router.get('/images', (req, res, next) => {
	let date = new Date();
	let fileName = req.body['fileName'];
	let certName = req.body['certName'];
	res.status(200).json(
		{
		  "messages": [
		    {
		      "attachment": {
		        "type": "image",
		        "payload": {
		          "url": "https://res.cloudinary.com/ddqkeaqnm/image/upload/c_thumb,g_face:auto,h_255,w_255/l_Cloudinary:certificate,y_60/l_text:Georgia_16_bold_center:" + date.toString() + ",x_-262,y_-14,co_rgb:594b3C/l_text:Futura_22_italic_center:" + certName + ",y_61,co_rgb:FFFFFF,a_-7/" + fileName
		        }
		      }
		    }
		  ]
		}

);
});

router.post('/images', (req, res, next) => {
	let fileName = req.body['fileName'];
	let certName = req.body['certName'];

	const temp_date = new Date();
	
	var day = temp_date.getDate();
	var hours = temp_date.getHours() + 2;

	if (hours > 24){
		hours = hours - 24;
		day += 1;
	}

	const time = (hours).toString() + ':' + (temp_date.getMinutes()).toString() + ':' + (temp_date.getSeconds()).toString();
	const date = day.toString() + '.' + (temp_date.getMonth() + 1).toString() + '.' + temp_date.getFullYear().toString();


	console.log("fileName : " + fileName);
	console.log("certName : " + certName);
	console.log("date : " + date.toString());

	res.status(200).json(
		{
		  "messages": [
		    {
		      "attachment": {
		        "type": "image",
		        "payload": {
		          "url": "https://res.cloudinary.com/ddqkeaqnm/image/upload/c_thumb,g_face:auto,h_655,w_455/l_Cloudinary:frame,y_60/l_text:Georgia_16_bold_center:" + date + ",x_-262,y_-14,co_rgb:594b3C/l_text:Futura_22_italic_center:" + certName + ",y_61,co_rgb:FFFFFF,a_-7/" + fileName
		        }
		      }
		    }
		  ]
		}
	);
});

//<=====================Gif-voting right/wrong template broadcast API================================>

router.get('/quiz-template-broadcast', (req, res, next) => {
	res.status(200).json({
		message: 'Get request handled!'
	});
});

router.post('/quiz-template-broadcast', (req, res, next) => {
	var countCorrect = 0;

	for(var i=0; i < req.body.data.length; i++){
		if(req.body.data[i].correct_anwser === req.body.data[i].anwser){
			countCorrect += 1;
		}
	}
	//Initializing ID variables
	const botId = req.body.broadcast_data.chatfuel_bot_id;
	const chatfuel_token = req.body.broadcast_data.chatfuel_token;

	const userId = req.body.broadcast_data.messenger_id;
	const block_name = req.body.broadcast_data.block_name;
	
	const broadcastApiUrl = 'https://api.chatfuel.com/bots/' + botId + '/users/' + userId + '/send?chatfuel_token=' + chatfuel_token + '&chatfuel_block_name=' + block_name + '&countCorrect=' + countCorrect;
	console.log(broadcastApiUrl);

	// Send a POST request to chatfue api with specific Content type
    var postData = {
    };

    let axiosConfig = {
      headers: {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",
      }
    };

    axios.post(broadcastApiUrl, postData, axiosConfig)
    .then((res) => {
      console.log("RESPONSE RECEIVED: ", res);
    })
    .catch((err) => {
      console.log("AXIOS ERROR: ", err);
    })

	res.status(200).json({
		message: 'Post request handled!'
	});

});

//<=====================Gif-voting pick one template broadcast API================================>

router.get('/quiz-template-broadcast2', (req, res, next) => {
	res.status(200).json({
		message: 'Get request handled!'
	});
});

router.post('/quiz-template-broadcast2', (req, res, next) => {
	var countCorrect = "This picker template!";

	//Initializing ID variables
	const botId = req.body.broadcast_data.chatfuel_bot_id;
	const chatfuel_token = req.body.broadcast_data.chatfuel_token;

	const userId = req.body.broadcast_data.messenger_id;
	const block_name = req.body.broadcast_data.block_name;
	
	const broadcastApiUrl = 'https://api.chatfuel.com/bots/' + botId + '/users/' + userId + '/send?chatfuel_token=' + chatfuel_token + '&chatfuel_block_name=' + block_name + '&countCorrect=' + countCorrect;
	console.log(broadcastApiUrl);

	// Send a POST request to chatfue api with specific Content type
    var postData = {
    };

    let axiosConfig = {
      headers: {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",
      }
    };

    axios.post(broadcastApiUrl, postData, axiosConfig)
    .then((res) => {
      console.log("RESPONSE RECEIVED: ", res);
    })
    .catch((err) => {
      console.log("AXIOS ERROR: ", err);
    })

	res.status(200).json({
		message: 'Post request handled!'
	});

});

 //<====================Test for question api DB ================================>
//get/post requests for questions
router.get('/test/questions', (req, res, next) => {
	Question.find()
	.exec()
	.then(docs => {
		console.log(docs);
		res.status(200).json(docs);
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({error : err});
	});
});


//<------------------CURRENCY EXCHANGE API---------------------------------->



//Function for obtaining exchange rate from internet
async function getExchange(currency_exchange_joined){
	var data = false;
	await axios.get('https://free.currencyconverterapi.com/api/v5/convert?q=' + currency_exchange_joined + '&compact=ultra')
	  .then(response => {
	  	data = response.data;
	  	console.log("Exchange rate obtained!")
	    console.log(response.data);
	  })
	  .catch(error => {
	    console.log(error);
	});
	return data;
}


//API for currency exchange rate
router.get('/currency_exchange/:currency_exchange_query', async (req, res, next) => {
	//First we get query for exchange and exchange rate from other api
	const currency_exchange_joined = req.params.currency_exchange_query;
	var exchangeRate = await getExchange(currency_exchange_joined);

	//We check if exchange rate was obtained and respond with data
	if(Object.keys(exchangeRate).length !== 0){
		res.status(200).json({
			"messages": [
				{"text": "Welcome to the NLB Vita Exchange API"},
				{"text": "Exchange rate you requested is: "},
				{"text": Object.values(exchangeRate).toString() }
			]	
		});
	}else{
		res.status(200).json({
			message: 'Your input of short Currency names was inccorect!',
			currency_exchange_joined: currency_exchange_joined
		});
	};
});

router.post('/currency_exchange/:currency_exchange_query', async (req, res, next) => {
	//First we get query for exchange and exchange rate from other api
	const currency_exchange_joined = req.params.currency_exchange_query;
	var exchangeRate = await getExchange(currency_exchange_joined);

	//We check if exchange rate was obtained and respond with data
	if(Object.keys(exchangeRate).length !== 0){
		res.status(200).json({
			"messages": [
				{"text": "Welcome to the NLB Vita Exchange API"},
				{"text": "Info about exchange you requested is: "},
				{"text": (Object.values(exchangeRate) * req.body.amount).toString() }
			]	
		});
	}else{
		res.status(200).json({
			message: 'Your input of short Currency names was inccorect!',
			currency_exchange_joined: currency_exchange_joined
		});
	};
});

//<-----------------------EXPORTS-------------------------------->
	
module.exports = router;