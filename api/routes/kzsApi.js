const express = require('express');
const axios = require('axios');
const router = express.Router();
const Question = require('../models/question');

var qs = require('querystring');



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

router.get('/quiz-broadcast', (req, res, next) => {
	res.status(200).json({
		message: 'Get request handled!'
	});
});

router.post('/quiz-broadcast', (req, res, next) => {

	const botId = process.env.CHATFUEL_BOT_ID;
	const chatfuelToken = process.env.CHATFUEL_TOKEN;

	const userId = req.query.userId;
	const blockName = 'WebviewResponse';
	const chatfuelMessage = "This is response";
	
	const broadcastApiUrl = 'https://api.chatfuel.com/bots/' + botId + '/users/' + userId + '/send?chatfuel_token=' + chatfuelToken + '&chatfuel_message_tag=' + chatfuelMessage + '&chatfuel_block_name=' + blockName;
	console.log(broadcastApiUrl);
	res.status(200).json({
		message: 'Post request handled!'
	});
});