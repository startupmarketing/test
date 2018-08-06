const express = require('express');
const axios = require('axios');
const router = express.Router();
const mongoose = require('mongoose');

const QuestionNlbVita = require('../models/questionNlbVita');

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

//<===========================Question Api========================>


//get/delete/patch specific question
router.get('/questions/:questionId', (req, res, next) => {
	const id = req.params.questionId;
	QuestionNlbVita.findById(id)
	.exec()
	.then(doc => {
		console.log("From database", doc);
		if(doc){
			res.status(200).json(doc);
		}else {
			res.status(404).json({
				message: "Object does not exist"
			})
		}
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({error : err});
	});
});

router.delete('/questions/:questionId', (req, res, next) => {
	const id = req.params.questionId;
	QuestionNlbVita.remove({ _id: id })
	.exec()
	.then(result => {
		res.status(200).json(result);
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({error : err});
	});
});

router.patch('/questions/:questionId', (req, res, next) => {
	const id = req.params.questionId;
	const updateOps = {};
	for(const ops of req.body){
		updateOps[ops.propName] = ops.value;
	}
	QuestionNlbVita.update({ _id: id }, { $set: updateOps })
	.exec()
	.then(result => {
		res.status(200).json(result);
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({error : err});
	});
});




//get/post requests for questions
router.get('/questions', (req, res, next) => {

	QuestionNlbVita.find()
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

router.post('/questions', (req, res, next) => {
	const temp_date = new Date();
	
	var day = temp_date.getDate();
	var hours = temp_date.getHours() + 2;

	if (hours > 24){
		hours = hours - 24;
		day += 1;
	}

	const time = (hours).toString() + ':' + (temp_date.getMinutes()).toString() + ':' + (temp_date.getSeconds()).toString();
	const date = day.toString() + '.' + (temp_date.getMonth() + 1).toString() + '.' + temp_date.getFullYear().toString();

	const first_name = req.body['first name'];
	const last_name = req.body['last name'];
	const messenger_id = req.body['messenger user id'];
	const question = new QuestionNlbVita({
		_id : new mongoose.Types.ObjectId(),
		messenger_id: messenger_id,
		first_name: first_name,
		last_name: last_name,
		question: req.body.question,
		date: date,
		time: time
	});
	question.save()
	.then(result => {
		console.log(result);
		res.status(200).json({
			message: 'Post request handled!',
			result : question
		});
	}).catch(err => {
		console.log(err)
		res.status(500).json({
			error: err
		})
	});
});

//<============================EXPORTS============================>

module.exports = router;