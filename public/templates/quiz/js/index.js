var data = QUIZ_QUESTIONS
var urlParams = new URLSearchParams(window.location.search);

const USER_ID = urlParams.get('userId');
const CHATFUEL_BOT_ID = urlParams.get('chatfuel_bot_id');
const CHATFUEL_TOKEN = urlParams.get('chatfuel_token');
const BLOCK_NAME = urlParams.get('block_name');
const broadcast_data = {
  messenger_id : USER_ID,
  chatfuel_bot_id : CHATFUEL_BOT_ID,
  chatfuel_token : CHATFUEL_TOKEN,
  block_name : BLOCK_NAME
}

var loaded = false;


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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.count = 0;
    this.state = {
      topOpacity : 0,
      bottomOpacity : 0,
      question : data[this.count].question, 
      top_pic : data[this.count].top_pic,
      bottom_pic : data[this.count].bottom_pic,
      top_anwser_pic : data[this.count].anwser_pic_top,
      bot_anwser_pic : data[this.count].anwser_pic_bot,
    }
    this.handleClick = this.handleClick.bind(this);
  } 


  sendData(data){
    axios.post( URL + '/quiz-template-broadcast', {data, broadcast_data})
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
    console.log(data);
  }

  async continue(){
    if(this.count+1 !== data.length){
      this.count += 1;
      this.setState({
        topOpacity : 0,
        bottomOpacity : 0,
        question : data[this.count].question, 
        top_pic : data[this.count].top_pic,
        bottom_pic : data[this.count].bottom_pic,
        top_anwser_pic : data[this.count].anwser_pic_top,
        bot_anwser_pic : data[this.count].anwser_pic_bot
      })
    }else{
      this.sendData(data);
      closeWebview();
    }
  }

  async handleClick(anwser) {
    data[this.count].anwser = anwser;
    const checkAnwser = async () => {
      if(anwser === "top"){
        await this.setState({topOpacity : 1});
        await setTimeout(async () => {
          return this.continue();
        }, 350);
      }else{
        await this.setState({bottomOpacity : 1});
        await setTimeout(async () => {
          return this.continue();
        }, 350);
      }
    }; 
    await checkAnwser();
  }

  render() {
    return (
      <div>
        <div className="main-container">
            <div className="page__hd">
              <h1 className="page__title">{this.state.question}</h1>
              <p className="page__desc">Kratek kviz, ki vam lahko prinese lepo nagrado. </p>
            </div>

            <div>

                <div onClick={() => this.handleClick("top")} className="top-image">
                    <div style={{opacity : this.state.topOpacity}} className="answer">
                        <img src={this.state.top_anwser_pic} alt=""/>
                    </div>
                    <img src={this.state.top_pic} alt=""/>
                </div>
                
                <div className="separator-wrapper">
                    <div className="separator"><img src={"/public/templates/quiz/images/i_emoji.JPG"} alt="" height="20" width="20"/></div>
                </div>
                
                <div onClick={() => this.handleClick("bottom")} className="bottom-image">
                    <div style={{opacity : this.state.bottomOpacity}} className="answer">
                        <img src={this.state.bot_anwser_pic} alt=""/>
                    </div>
                    <img src={this.state.bottom_pic} alt=""/>
                </div>

            </div>

        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);



