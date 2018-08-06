var urlParams = new URLSearchParams(window.location.search);
const URL = 'https://api.messengerbot.si';
const URL_TEMP = 'http://localhost:8000';
var loaded = false;

const USER_ID = urlParams.get('userId');
const CHATFUEL_BOT_ID = urlParams.get('chatfuel_bot_id');
const CHATFUEL_TOKEN = urlParams.get('chatfuel_token');
const FIRST_NAME = urlParams.get('first_name');
const LAST_NAME = urlParams.get('last_name');
const TIMEZONE = urlParams.get('timezone');
const ARRIVAL_LOCATION = urlParams.get('arrival_location');
const BLOCK_NAME = urlParams.get('block_name');
const LANGUAGE = urlParams.get('language');


//for loading Mssenger Extension SDK functions
(function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/messenger.Extensions.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'Messenger'));

window.extAsyncInit = function() {
  console.log("Messenger extensions are ready!");

  window.MessengerExtensions.getSupportedFeatures(function success(result) {
    let features = result.supported_features;
    console.log(features);
    if(features.includes("context")){
      loaded = true;
    }
  }, function error(err) {
      console.log(err);
  });
};


// Close webview function
function closeWebview(){
  if(loaded){
    window.MessengerExtensions.requestCloseBrowser(function success() {
          console.log("Window will be closed!");
        }, function error(err) {
          console.log(err);
        });
  }else{
    alert("Webview can be viewed only on mobile devices on messenger app 113+. Please use it on mobile device and/or update your messenger app");
  }
}

function sendData(calendar_data){
    var temp_month;
    console.log(calendar_data);

    if(calendar_data[1].value > 9){
      temp_month = calendar_data[1].value;
    }else{
      temp_month = '0' + calendar_data[1].value;
    }

    var temp_date;
    if(calendar_data[2].value > 9){
      temp_date = calendar_data[2].value;
    }else{
      temp_date = '0' + calendar_data[2].value;
    }
    var DATE = calendar_data[0].value + "-" + temp_month + "-" + temp_date + "T12:00:00.000Z"

    var data = {
      messenger_id: USER_ID,
      chatfuel_bot_id: CHATFUEL_BOT_ID,
      chatfuel_token: CHATFUEL_TOKEN,
      first_name: FIRST_NAME,
      last_name: LAST_NAME,
      arrival_location: ARRIVAL_LOCATION,
      date_of_arrival: DATE,
      timezone: TIMEZONE,
      block_name: BLOCK_NAME,
      language: LANGUAGE
    }
    closeWebview();

    axios.post( URL + '/schedule/arrivalSchedules', data)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
  }


function calendar () {
  window.webvUI.datePicker({
      start: new Date().getFullYear(),
      end: new Date().getFullYear() + 2,
        onChange: function(result) {
          console.log(result);
        },
        onConfirm: function(result) {
          sendData(result);
        },
        onClose: function(result) {
          closeWebview();
        }

  });
}

calendar();