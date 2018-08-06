const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	messenger_id: Number,
	first_name: String,
	last_name: String, 
	question: String,
});

module.exports = mongoose.model('Question', questionSchema);
