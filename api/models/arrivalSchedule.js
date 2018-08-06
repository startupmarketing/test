const mongoose = require('mongoose');

const arrivalScheduleSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	messenger_id: String,
	chatfuel_bot_id: String,
	chatfuel_token: String,
	first_name: String,
	last_name: String,
	arrival_location: String,
	date_of_arrival: Date,
	timezone: Number,
	block_name: String,
	language: String
});

module.exports = mongoose.model('ArrivalSchedule', arrivalScheduleSchema);
