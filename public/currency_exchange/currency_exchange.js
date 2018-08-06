class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      EUR_USD : 0,
      EUR_HRK : 0,
      amount: 0,
      currencyFrom: 'USD',
      currencyTo: 'EUR',
      convertedAmount: 0
    };
    this.getExchangeRate();
    this.handleChangeAmount = this.handleChangeAmount.bind(this);
    this.handleSwitchCurrency = this.handleSwitchCurrency.bind(this);
    this.handleChangeCurrencyFrom = this.handleChangeCurrencyFrom.bind(this);
    this.handleChangeCurrencyTo = this.handleChangeCurrencyTo.bind(this);
    this.handleConvert = this.handleConvert.bind(this);
  }

//Function for obtaining exchange rate from internet
  async getExchangeRate(){
    var dataEUR_USD;
    var dataEUR_HRK;
    await axios.get('https://free.currencyconverterapi.com/api/v5/convert?q=EUR_USD&compact=ultra')
      .then(response => {
        dataEUR_USD = response.data;
        console.log("Exchange rate obtained!")
        console.log(response.data);
      })
      .catch(error => {
        console.log(error);
    });

    await axios.get('https://free.currencyconverterapi.com/api/v5/convert?q=EUR_HRK&compact=ultra')
      .then(response => {
        dataEUR_HRK = response.data;
        console.log("Exchange rate obtained!")
        console.log(response.data);

      })
      .catch(error => {
        console.log(error);
    });
    await this.setState({EUR_USD: dataEUR_USD.EUR_USD});
    await this.setState({EUR_HRK: dataEUR_HRK.EUR_HRK});
  }


//Function for calculation all conversion rates, from data obtained from internet
  getConversionRate(){
    if(this.state.currencyFrom === 'EUR' && this.state.currencyTo === 'USD'){
      return this.state.EUR_USD;

    }else if(this.state.currencyFrom === 'EUR' && this.state.currencyTo === 'HRK'){
      return this.state.EUR_HRK;

    }else if(this.state.currencyFrom === 'USD' && this.state.currencyTo === 'EUR'){
      return 1/this.state.EUR_USD;

    }else if(this.state.currencyFrom === 'HRK' && this.state.currencyTo === 'EUR'){
      return 1/this.state.EUR_HRK;
    }
    else if(this.state.currencyFrom === 'USD' && this.state.currencyTo === 'HRK'){
      return 1/this.state.EUR_USD * this.state.EUR_HRK;

    }else if(this.state.currencyFrom === 'HRK' && this.state.currencyTo === 'USD'){
      return 1/this.state.EUR_HRK * this.state.EUR_USD;
    }else if(this.state.currencyFrom === this.state.currencyTo){
      return 1;
    }
  }

//Function for switching currencies
  async handleSwitchCurrency(event){
    var tempCurrencyFrom = this.state.currencyFrom;
    var tempCurrencyTo = this.state.currencyTo;
    await this.setState({currencyFrom: tempCurrencyTo});
    await this.setState({currencyTo: tempCurrencyFrom});
    if(this.state.amount !== 0){
      this.handleConvert();
    }
  }

  handleChangeAmount(event) {
    this.setState({amount: event.target.value});
  }


  async handleChangeCurrencyFrom(event) {
    await this.setState({currencyFrom: event.target.value});
    if(this.state.amount !== 0){
      await this.handleConvert();
    }
  }

  async handleChangeCurrencyTo(event) {
    await this.setState({currencyTo: event.target.value});
    if(this.state.amount !== 0){
      await this.handleConvert();
    }
  }

  async handleConvert(event) {
    var convertedAmount = this.state.amount * this.getConversionRate()
    this.setState({ convertedAmount : convertedAmount});
  }

    render() {
        return (
          <div className="main-container">
            <div className="currency-content">
              <div className="currency-content">

                <div className="swap-top">
                      <img src="/public/currency_exchange/img/i_arrow-swap.svg" alt="" height="30" width="30"/>
                  </div>

                <div className="currencyFrom">
                    <label className="webvUI-cells__title">Iz</label>

                    <div className="webvUI-cells">
                      <div className="webvUI-cell webvUI-cell_select">
                        <div className="webvUI-cell__bd">
                            <select
                              value={this.state.currencyFrom}
                              onChange={this.handleChangeCurrencyFrom} 
                              className="webvUI-select"
                            >     
                                <option value="USD">USD - Ameriški dolar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="HRK">HRK - Hrvaška kuna</option>
                            </select>
                        </div>
                      </div>
                    </div>
                </div>
      
            <div className="swap">
                      <img onClick={this.handleSwitchCurrency} src="/public/currency_exchange/img/i_arrow-swap.svg" alt="" height="30" width="30"/>
                  </div>

                  <div className="currencyTo">
                    <label className="webvUI-cells__title">V</label>
                    <div className="webvUI-cells">
                      <div className="webvUI-cell webvUI-cell_select">
                          <div className="webvUI-cell__bd">
                              <select
                                value={this.state.currencyTo}
                                onChange={this.handleChangeCurrencyTo}
                                className="webvUI-select"
                              >     
                                  <option value="USD">USD - Ameriški dolar</option>
                                  <option value="EUR">EUR - Euro</option>
                                  <option value="HRK">HRK - Hrvaška kuna</option>
                              </select>
                          </div>
                      </div>
                    </div>
                </div>
                </div>
              </div>
              <br/>

            <div className="webvUI-flex">

                <div className="webvUI-flex__item">
                    <div className="placeholder">
                        <label className="webvUI-cells__title">Znesek</label>

                        <div className="webvUI-cells">
                            <div className="webvUI-cell">
                                <div className="webvUI-cell__bd">
                                    <input onChange={this.handleChangeAmount} className="webvUI-input" type="text" placeholder="0"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="arrow-right">
                  <div className="placeholder">
                      <div className="arrow">
                          <img src="/public/currency_exchange/img/i_arrow-right.svg" alt="" height="20" width="20"/>
                      </div>
                  </div>
                </div>

                <div className="webvUI-flex__item">
                  <div className="placeholder">
                      <label className="webvUI-cells__title"></label>
                      <div className="result">{this.state.convertedAmount.toFixed(2)} {this.state.currencyTo}</div>
                  </div>
                </div>
            </div>  

            <div className="pretvori">
              <div className="webvUI-bottombtn">
                  <button onClick={this.handleConvert} className="webvUI-btn webvUI-btn_primary">Pretvori</button>    
              </div>
          </div>
          </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);