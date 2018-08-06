const express = require('express');
const axios = require('axios');
const router = express.Router();

var qs = require('querystring');

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

//Testing req/res
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

//Gif-voting broadcast

router.get('/quiz-broadcast-slo', (req, res, next) => {
	res.status(200).json({
		message: 'Get request handled!'
	});
});

router.post('/quiz-broadcast-slo', (req, res, next) => {
	
	var romantik = 0;
	var gurman = 0;
	var avanturist = 0;

	for(var i=0; i < req.body.data.length; i++){
		if(req.body.data[i].anwser === 'romantik'){
			romantik += 1;
		}
		else if (req.body.data[i].anwser === 'gurman'){
			gurman += 1;
		}
		else if(req.body.data[i].anwser === 'avanturist'){
			avanturist += 1;
		}
	}

	var personality;

	if(romantik > gurman){
		if(romantik > avanturist){
			personality = 'romantik';
		}else if( romantik < avanturist){
			personality = 'avanturist';
		}else{
			console.log("romantik in avanturist enaka!");
			var random = getRandomInt(2);
			if(random === 0){
				console.log("ROMANTIK");
				personality = 'romantik';
			}else{
				console.log("AVANTURIST");
				personality = 'avanturist';
			}
		}
	}else if (romantik < gurman){
		if(gurman > avanturist){
			personality = 'gurman';
		}else if (gurman < avanturist){
			personality = 'avanturist';
		}else{
			console.log("Gurman in avanturist enaka");
			var random = getRandomInt(2);
			if(random === 0){
				console.log("GURMAN");
				personality = 'gurman';
			}else{
				console.log("AVANTURIST");
				personality = 'avanturist';
			}
		}
	}else{
		if(gurman < avanturist){
			personality = 'avanturist';

		}else if (gurman === avanturist){
			console.log("Vsi trije so enaki!");
			var random = getRandomInt(3);
			if(random === 0){
				console.log("GURMAN");
				personality = 'gurman';
			}else if (random === 1){
				console.log("AVANTURIST");
				personality = 'avanturist';
			}else{
				console.log("ROMANTIK");
				personality = 'romantik';
			}
		}else{
			console.log("Gurman in romantik enaka");
			var random = getRandomInt(2);
			if(random === 0){
				console.log("GURMAN");
				personality = 'gurman';
			}else{
				console.log("ROMANTIK");
				personality = 'romantik';
			}	
		}
	}

	console.log('Osebnost: ' + personality);
	console.log(req.body.broadcast_data);

	const botId = req.body.broadcast_data.chatfuel_bot_id;


	const chatfuelToken = req.body.broadcast_data.chatfuel_token;


	const userId = req.body.broadcast_data.messenger_id;


	const broadcastApiUrl = 'https://api.chatfuel.com/bots/' + botId + '/users/' + userId + '/send?chatfuel_token=' + chatfuelToken + '&chatfuel_block_name=' + personality;
	console.log(broadcastApiUrl);
	res.status(200).json({
		message: 'Post request handled!'
	});

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

router.get('/quiz-broadcast-eng', (req, res, next) => {
	res.status(200).json({
		message: 'Get request handled!'
	});
});

router.post('/quiz-broadcast-eng', (req, res, next) => {
	
	var romantic = 0;
	var gurmet = 0;
	var adventurer = 0;

	for(var i=0; i < req.body.data.length; i++){
		if(req.body.data[i].anwser === 'romantic'){
			romantic += 1;
		}
		else if (req.body.data[i].anwser === 'gurmet'){
			gurmet += 1;
		}
		else if(req.body.data[i].anwser === 'adventurer'){
			adventurer += 1;
		}
	}

	var personality;

	if(romantic > gurmet){
		if(romantic > adventurer){
			personality = 'romantic';
		}else if( romantic < adventurer){
			personality = 'adventurer';
		}else{
			console.log("romantic and adventurer the same!");
			var random = getRandomInt(2);
			if(random === 0){
				console.log("ROMANTIC");
				personality = 'romantic';
			}else{
				console.log("ADVENTURER");
				personality = 'adventurer';
			}
		}
	}else if (romantic < gurmet){
		if(gurmet > adventurer){
			personality = 'gurmet';
		}else if (gurmet < adventurer){
			personality = 'adventurer';
		}else{
			console.log("Gurmet and adventurer the same");
			var random = getRandomInt(2);
			if(random === 0){
				console.log("GURMET");
				personality = 'gurmet';
			}else{
				console.log("ADVENTURER");
				personality = 'adventurer';
			}
		}
	}else{
		if(gurmet < adventurer){
			personality = 'adventurer';

		}else if (gurmet === adventurer){
			console.log("All three are the same!");
			var random = getRandomInt(3);
			if(random === 0){
				console.log("GURMET");
				personality = 'gurmet';
			}else if (random === 1){
				console.log("ADVENTURER");
				personality = 'adventurer';
			}else{
				console.log("ROMANTIC");
				personality = 'romantic';
			}
		}else{
			console.log("Gurmet and romantic are the same");
			var random = getRandomInt(2);
			if(random === 0){
				console.log("GURMET");
				personality = 'gurmet';
			}else{
				console.log("ROMANTIC");
				personality = 'romantic';
			}	
		}
	}

	console.log('Personality: ' + personality);
	console.log(req.body.broadcast_data);

	const botId = req.body.broadcast_data.chatfuel_bot_id;


	const chatfuelToken = req.body.broadcast_data.chatfuel_token;


	const userId = req.body.broadcast_data.messenger_id;


	const broadcastApiUrl = 'https://api.chatfuel.com/bots/' + botId + '/users/' + userId + '/send?chatfuel_token=' + chatfuelToken + '&chatfuel_block_name=' + personality;
	console.log(broadcastApiUrl);
	res.status(200).json({
		message: 'Post request handled!'
	});

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

//<============================EXPORTS============================>

module.exports = router;