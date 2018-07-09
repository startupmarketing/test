var loaded = false;
function closeWebview(){
  alert("Working");
  MessengerExtensions.requestCloseBrowser(function success() {
    console.log("Window will be closed!");
  }, function error(err) {
    console.log(err);
  });
}

class Greeting extends React.Component {
  constructor(props) {
  super(props);

  // This binding is necessary to make `this` work in the callback
  this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    console.log("Working");
    closeWebview();
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        Close
      </button>
    );
  }
}

ReactDOM.render(
  <Greeting />,
  document.getElementById('app')
);

window.extAsyncInit = function() {
  console.log("Messenger extensions are ready!");
  MessengerExtensions.getSupportedFeatures(function success(result) {
    let features = result.supported_features;
    console.log(features);
    if(features.includes("context")){
      loaded = true;
    }
    }, function error(err) {
      console.log(err);
  });
};

