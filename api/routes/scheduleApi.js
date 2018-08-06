const express = require('express');
const axios = require('axios');
const router = express.Router();
const ArrivalSchedule = require('../models/arrivalSchedule');
const mongoose = require('mongoose');
const schedule = require('node-schedule');
var LIST_OF_ARRIVALS = [];

var qs = require('querystring');

//<----------------------FUNCTIONS------------------------------>

//<===========================Testing req/res=============================>
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


//<===========================ArrivalSchedule API =======================>

//<---------------------------------Arrival schedule jobs-------------------------------->
async function getListMoreThanTwelve (timezone) {
    var date = new Date(); 
    var date1 = new Date(
        date.getFullYear(), 
        date.getMonth(), 
        date.getDate() + 2,
        0, 
        0, 
        0
    );

    var date2 = new Date(
        date.getFullYear(), 
        date.getMonth(), 
        date.getDate() + 3,
        0, 
        0, 
        0
    );

    console.log("Fetching jobs from DB");
    await ArrivalSchedule.find({date_of_arrival: {$gt: date1, $lt: date2}, timezone: timezone})
    .exec()
    .then(docs => {
        LIST_OF_ARRIVALS = docs;
        console.log(docs);
    })
    .catch(err => {
        console.log(err);
    });

    //for loop for extracting information for schedule node
    // WE MUST CONSIDER TIMEZONES, so that server fires job right on time for user
    //Later add - Timezone to hours
    for(var i=0; i < LIST_OF_ARRIVALS.length; i++){
        var botId = LIST_OF_ARRIVALS[i].chatfuel_bot_id;
        var chatfuelToken = LIST_OF_ARRIVALS[i].chatfuel_token;

        var userId = LIST_OF_ARRIVALS[i].messenger_id;
        var blockName = LIST_OF_ARRIVALS[i].block_name;
                        
        var broadcastApiUrl = 'https://api.chatfuel.com/bots/' + botId + '/users/' + userId + '/send?chatfuel_token=' + chatfuelToken + '&chatfuel_block_name=' + blockName;

        // Send a POST request to chatfue api with specific Content type
        var postData = {
        };

        var axiosConfig = {
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*",
            }
        };

                
        await axios.post(broadcastApiUrl, postData, axiosConfig)
        .then((res) => {
            console.log("RESPONSE RECEIVED: ", res);
        })
        .catch((err) => {
            console.log("AXIOS ERROR: ", err);
        })

        console.log("REMOVING ENTRY FROM DB AND LIST OF ARRIVALS");

        await ArrivalSchedule.remove({ _id: LIST_OF_ARRIVALS[i]._id })
        .exec()
        .then(result => {
        })
        .catch(err => {
            console.log(err);
        });
    }
}

async function getListMinusTwelve (timezone) {
    var date = new Date(); 
    var date1 = new Date(
        date.getFullYear(), 
        date.getMonth(), 
        date.getDate(),
        0, 
        0, 
        0
    );

    var date2 = new Date(
        date.getFullYear(), 
        date.getMonth(), 
        date.getDate() + 1,
        0, 
        0, 
        0
    );

    console.log("Fetching jobs from DB");
    await ArrivalSchedule.find({date_of_arrival: {$gt: date1, $lt: date2}, timezone: timezone})
    .exec()
    .then(docs => {
        LIST_OF_ARRIVALS = docs;
        console.log(docs);
    })
    .catch(err => {
        console.log(err);
    });

    //for loop for extracting information for schedule node
    // WE MUST CONSIDER TIMEZONES, so that server fires job right on time for user
    //Later add - Timezone to hours
    for(var i=0; i < LIST_OF_ARRIVALS.length; i++){
        var botId = LIST_OF_ARRIVALS[i].chatfuel_bot_id;
        var chatfuelToken = LIST_OF_ARRIVALS[i].chatfuel_token;

        var userId = LIST_OF_ARRIVALS[i].messenger_id;
        var blockName = LIST_OF_ARRIVALS[i].block_name;
                        
        var broadcastApiUrl = 'https://api.chatfuel.com/bots/' + botId + '/users/' + userId + '/send?chatfuel_token=' + chatfuelToken + '&chatfuel_block_name=' + blockName;

        // Send a POST request to chatfue api with specific Content type
        var postData = {
        };

        var axiosConfig = {
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*",
            }
        };

                
        await axios.post(broadcastApiUrl, postData, axiosConfig)
        .then((res) => {
            console.log("RESPONSE RECEIVED: ", res);
        })
        .catch((err) => {
            console.log("AXIOS ERROR: ", err);
        })

        console.log("REMOVING ENTRY FROM DB AND LIST OF ARRIVALS");

        await ArrivalSchedule.remove({ _id: LIST_OF_ARRIVALS[i]._id })
        .exec()
        .then(result => {
        })
        .catch(err => {
            console.log(err);
        });
    }
}


async function getListGeneral (timezone) {
    var date = new Date(); 
    var date1 = new Date(
        date.getFullYear(), 
        date.getMonth(), 
        date.getDate() + 1,
        0, 
        0, 
        0
    );

    var date2 = new Date(
        date.getFullYear(), 
        date.getMonth(), 
        date.getDate() + 2,
        0, 
        0, 
        0
    );

    console.log("Fetching jobs from DB");
    await ArrivalSchedule.find({date_of_arrival: {$gt: date1, $lt: date2}, timezone: timezone})
    .exec()
    .then(docs => {
        LIST_OF_ARRIVALS = docs;
        console.log(docs);
    })
    .catch(err => {
        console.log(err);
    });

    //for loop for extracting information for schedule node
    // WE MUST CONSIDER TIMEZONES, so that server fires job right on time for user
    //Later add - Timezone to hours
    for(var i=0; i < LIST_OF_ARRIVALS.length; i++){
        var botId = LIST_OF_ARRIVALS[i].chatfuel_bot_id;
        var chatfuelToken = LIST_OF_ARRIVALS[i].chatfuel_token;

        var userId = LIST_OF_ARRIVALS[i].messenger_id;
        var blockName = LIST_OF_ARRIVALS[i].block_name;
                        
        var broadcastApiUrl = 'https://api.chatfuel.com/bots/' + botId + '/users/' + userId + '/send?chatfuel_token=' + chatfuelToken + '&chatfuel_block_name=' + blockName;
        console.log(broadcastApiUrl);

        // Send a POST request to chatfue api with specific Content type
        var postData = {
        };

        var axiosConfig = {
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*",
            }
        };

                
        await axios.post(broadcastApiUrl, postData, axiosConfig)
        .then((res) => {
            console.log("RESPONSE RECEIVED: ", res);
        })
        .catch((err) => {
            console.log("AXIOS ERROR: ", err);
        })

        console.log("REMOVING ENTRY FROM DB AND LIST OF ARRIVALS");

        await ArrivalSchedule.remove({ _id: LIST_OF_ARRIVALS[i]._id })
        .exec()
        .then(result => {
        })
        .catch(err => {
            console.log(err);
        });
    }
}

//----------------------------CREATING JOBS FOR EVERY HOUR-------------------------------------------------
var j0 = schedule.scheduleJob('0 0 12 * * *', function(){
    getListGeneral(0);
});

var j1 = schedule.scheduleJob('0 0 11 * * *', function(){
    getListGeneral(1);
});

var j2 = schedule.scheduleJob('0 0 10 * * *', function(){
    getListGeneral(2);
});

var j3 = schedule.scheduleJob('0 0 9 * * *', function(){
    getListGeneral(3);
});

var j4 = schedule.scheduleJob('0 0 8 * * *', function(){
    getListGeneral(4);
});

var j5 = schedule.scheduleJob('0 0 7 * * *', function(){
    getListGeneral(5);
});

var j6 = schedule.scheduleJob('0 0 6 * * *', function(){
    getListGeneral(6);
});

var j7 = schedule.scheduleJob('0 0 5 * * *', function(){
    getListGeneral(7);
});

var j8 = schedule.scheduleJob('0 0 4 * * *', function(){
    getListGeneral(8);
});

var j9 = schedule.scheduleJob('0 0 3 * * *', function(){
    getListGeneral(9);
});

var j10 = schedule.scheduleJob('0 0 2 * * *', function(){
    getListGeneral(10);
});

var j11 = schedule.scheduleJob('0 0 1 * * *', function(){
    getListGeneral(11);
});

var j12 = schedule.scheduleJob('0 0 0 * * *', function(){
    getListGeneral(12);
});

var j13 = schedule.scheduleJob('0 0 23 * * *', function(){
    getListMoreThanTwelve(13);
});

var j14 = schedule.scheduleJob('0 0 22 * * *', function(){
    getListMoreThanTwelve(14);
});

var j_1 = schedule.scheduleJob('0 0 13 * * *', function(){
    getListGeneral(-1);
});

var j_2 = schedule.scheduleJob('0 0 14 * * *', function(){
    getListGeneral(-2);
});

var j_3 = schedule.scheduleJob('0 0 15 * * *', function(){
    getListGeneral(-3);
});

var j_4 = schedule.scheduleJob('0 0 16 * * *', function(){
    getListGeneral(-4);
});

var j_5 = schedule.scheduleJob('0 0 17 * * *', function(){
    getListGeneral(-5);
});

var j_6 = schedule.scheduleJob('0 0 18 * * *', function(){
    getListGeneral(-6);
});

var j_7 = schedule.scheduleJob('0 0 19 * * *', function(){
    getListGeneral(-7);
});

var j_8 = schedule.scheduleJob('0 0 20 * * *', function(){
    getListGeneral(-8);
});

var j_9 = schedule.scheduleJob('0 0 21 * * *', function(){
    getListGeneral(-9);
});

var j_10 = schedule.scheduleJob('0 0 22 * * *', function(){
    getListGeneral(-10);
});

var j_11 = schedule.scheduleJob('0 0 23 * * *', function(){
    getListGeneral(-11);
});

var j_12 = schedule.scheduleJob('0 0 0 * * *', function(){
    getListMinusTwelve(-12);
});


//<------------------------get/delete/patch specific arrival---------------------------->

router.get('/arrivalSchedules/:arrivalScheduleId', (req, res, next) => {
    const id = req.params.arrivalScheduleId;
    ArrivalSchedule.findById(id)
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

router.delete('/arrivalSchedules/:arrivalScheduleId', (req, res, next) => {
    const id = req.params.arrivalScheduleId;
    ArrivalSchedule.remove({ _id: id })
    .exec()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error : err});
    });
});

router.patch('/arrivalSchedules/:arrivalScheduleId', (req, res, next) => {
    const id = req.params.arrivalScheduleId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    ArrivalSchedule.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error : err});
    });
});


//<---------------------------get/post requests for questions------------------------------->
router.get('/arrivalSchedules', (req, res, next) => {
    ArrivalSchedule.find()
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

router.post('/arrivalSchedules', (req, res, next) => {
    const messenger_id = req.body['messenger_id'];
    const chatfuel_bot_id = req.body['chatfuel_bot_id'];
    const chatfuel_token = req.body['chatfuel_token'];
    const first_name = req.body['first_name'];
    const last_name = req.body['last_name'];
    const arrival_location =  req.body['arrival_location'];
    const date_of_arrival =  req.body['date_of_arrival'];
    const timezone = req.body['timezone'];
    const block_name = req.body['block_name'];
    const language = req.body['language'];
    
    const arrivalSchedule = new ArrivalSchedule({
        _id : new mongoose.Types.ObjectId(),
        messenger_id: messenger_id,
        chatfuel_bot_id: chatfuel_bot_id,
        chatfuel_token: chatfuel_token,
        first_name: first_name,
        last_name: last_name,
        arrival_location: arrival_location,
        date_of_arrival: date_of_arrival,
        timezone: timezone,
        block_name: block_name,
        language: language
    });

    //var date_post = date_of_arrival.getYear() + ' ' + date_of_arrival.getMonth() + ' ' + date_of_arrival.getDate();
    const temp_date = new Date(date_of_arrival);

    const date_post = temp_date.getDate() + '.' + (temp_date.getMonth()+1) + '. ' + temp_date.getFullYear() 

    arrivalSchedule.save()
    .then(result => {
        console.log(result);

        const broadcastApiUrl = 'https://api.chatfuel.com/bots/' + chatfuel_bot_id + '/users/' + messenger_id + '/send?chatfuel_token=' + chatfuel_token + '&chatfuel_block_name=timetestresponse' + '&date_of_arrival=' + date_post;

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

    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    });
});


//<============================EXPORTS============================>

module.exports = router;