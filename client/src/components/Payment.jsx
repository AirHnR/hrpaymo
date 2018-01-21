import React from 'react';
import axios from 'axios';
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import AutoComplete from 'material-ui/AutoComplete';
import PayeeWallets from './PayeeWallets.jsx';
import PayorWallets from './PayorWallets.jsx';

const style = {
  form: {
  },
  input: {
    background: '#fff',
    flex: 'auto',
  },
  button: {
    label: {
      color: '#fff',
      position: 'relative'
    },
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    width: 30,
  }
}

class Payment extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      payeeUsername: '',
      amount: '',
      amount_to: '',
      note: '',
      paymentFail: false,
      usernames: [],
      payeeWallets: [],
      currency_from_type: '',
      currency_to_type: '',
      wallet_from_id: '',
      wallet_to_id: '',
    }
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.props.payeeUsername) {
        this.setState({
          payeeUsername: this.props.payeeUsername
        })
        this.getPayeeWallets(this.props.payeeUsername);
      }
    }, 300);

    axios('/usernames', { params: { userId: this.props.payerId }})
    .then(response => {
      this.setState({
        usernames: response.data.usernames
      });
    })
    .catch(err => {
      console.error(err);
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currency_from_type !== this.state.currency_from_type) {
      if (this.state.currency_from_type) {
        this.getExchangeRate();
      }
    }
    if (prevState.currency_to_type !== this.state.currency_to_type) {
      if (this.state.currency_from_type) {
        this.getExchangeRate();
      }
    }
    if (prevState.amount !== this.state.amount) {
      if (this.state.amount) {
        this.getExchangeRate();
      }
    }
  }
  
  handleInputChanges (event) {
    let target = event.target;
    this.setState({
      [target.name] : target.value
    })
  }

  onDropdownInput(searchText) {
    this.setState({
      payeeUsername: searchText
    });
    this.getPayeeWallets(searchText);
  }

  updateState (key, value) {
    this.setState({
      [key]: value
    });
  }

  getPayeeWallets (payeeUsername) {
    axios('/payee/wallets', { params: { username: payeeUsername }})
    .then(response => {
      this.setState({
        payeeWallets: response.data
      });
    })
    .catch(err => {
      console.error(err);
    })
  }

  calcfxRate (fxObj) {
    let currencyFrom = `USD${this.state.currency_from_type}`;
    let currencyTo = `USD${this.state.currency_to_type}`;

    let result = this.state.amount / fxObj[currencyFrom] * fxObj[currencyTo];
    console.log(result);
    result = parseFloat(result).toFixed(2);
    return result;
  }

  getExchangeRate () {
    axios.get('/exchangeRate', {params: {
      currencyFrom: this.state.currency_from_type, 
      currencyTo: this.state.currency_to_type
    }}).then(response => {
      console.log(response.data);
      let amountTo = this.calcfxRate (response.data);
      this.setState({
        amount_to: amountTo
      });
    })
    // axios.get('http://apilayer.net/api/live', 
    // {params: {access_key: '6c3938f9ca0181b6c222db4d74c0dffb',
    //           currencies: `${this.state.currency_from_type}, ${this.state.currency_to_type}`}
    // }).then(response => {
    //   console.log(response.data.quotes);
    //   let amountTo = this.calcfxRate (response.data.quotes);
    //   this.setState({
    //     amount_to: amountTo
    //   });
    // })
  }

  payUser() {
    let payment = {
      payerId: this.props.payerId,
      payeeUsername: !this.state.payeeUsername ? this.props.payeeUsername : this.state.payeeUsername,
      amount: this.state.amount,
      wallet_from_id: this.state.wallet_from_id,
      wallet_to_id: this.state.wallet_to_id,
      currency_from_type: this.state.currency_from_type,
      currency_to_type: this.state.currency_to_type,
      amount_to: this.state.amount_to,
      note: this.state.note
    };
    axios.post('/pay', payment)
      .then((response) => {
        this.setState({
          payeeUsername: '',
          amount: '',
          note: '',
          amount_to: '',
          wallet_from_id: '',
          wallet_to_id: '',
          currency_to_type: '',
          currency_from_type: '',
          paymentFail: false
        });
        setTimeout(() => this.props.refreshUserData(this.props.payerId), 400);
      })
      .catch(error => {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              console.error('UNAUTHORIZED:', error.response);
              break;
            case 422:
              console.error('UNPROCESSABLE ENTRY:', error.response);
              break;
            case 400:
              console.error('BAD REQUEST:', error.response);
              break;
          }
        } else {
          console.error('Error in payment component:', error);
        }
        this.setState({
          paymentFail: true
        });
      })
  }

  renderConfirmationText () {
    if (this.state.amount_to) {
      return (
        <div>
          {`${this.state.currency_to_type} 
          ${this.state.amount_to} will be paid to 
          ${this.state.payeeUsername}`}
        </div>
      )
    }
  }

  render() {
    return (
      <Paper className='payment-container' style={style.form}>
        <div className='payment-item-container'>         
            {!this.props.payeeUsername && 
              <div className="form-box payment-username">
                <AutoComplete
                  hintText="Enter a username"
                  floatingLabelText="To:"
                  style={style.input}
                  name='payeeUsername'
                  filter={AutoComplete.caseInsensitiveFilter}
                  dataSource={this.state.usernames ? this.state.usernames : []}
                  maxSearchResults={7}
                  searchText={this.state.payeeUsername}
                  onUpdateInput = {this.onDropdownInput.bind(this)}
                />
              </div>
            }
          <br />
          <PayeeWallets 
            wallets={this.state.payeeWallets}
            updateState={this.updateState.bind(this)}
          />
          <div className="form-box payment-amount">
            <TextField
              style={style.input}
              name='amount'
              value={this.state.amount}
              onChange = {this.handleInputChanges.bind(this)}
              hintText="Enter an amount"
              floatingLabelText="$"
            />
          <br />
          </div>
          <PayorWallets 
            wallets={this.props.wallets}
            updateState={this.updateState.bind(this)}
          />
          <div className="form-box payment-note">
            <TextField
              style={style.input}
              name='note'
              value={this.state.note}
              onChange = {this.handleInputChanges.bind(this)}
              hintText="for"
              floatingLabelText="Leave a comment"
              fullWidth={true}
              multiLine={true}
            />
          <br />
          </div>
        </div>
        {this.renderConfirmationText()}
        <button className='btn' onClick={this.payUser.bind(this)}>Pay</button>
        {this.state.paymentFail
          ? <label className='error-text'>
              Error in payment processing
            </label>
          : null
        }
      </Paper>
    );
  }
}

export default Payment;