import React from 'react';
import axios from 'axios';
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import AutoComplete from 'material-ui/AutoComplete';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
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
      emojis: [],
      comment: '',
      open: false,
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
    // event.preventDefault();
    let target = event.target;
    this.setState({
      [target.name] : target.value,
      anchorEl: event.currentTarget
    })
        // event.preventDefault();
    this.getEmojiOnNoteChange(target.value);
  }

  getEmojiOnNoteChange (input) {
    var commentArray = input.split(' ');
    var mostRecentWord = commentArray[commentArray.length - 1]
    if (mostRecentWord.length > 2) {
      axios.get('/emoji', {params: {note: mostRecentWord}})
        .then( ({data}) => {
          var arrayOfEmojis = data.rows.map( (reactionObj) => {
            return reactionObj.r_emoji;
          })
          this.setState({
            emojis: arrayOfEmojis,
          })
        })
        .catch(err => console.log(err))    
    }
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
  }

  payUser() {
    let payment = {
      payerId: this.props.payerId,
      payeeUsername: !this.state.payeeUsername ? this.props.payeeUsername : this.state.payeeUsername,
      amount: this.state.amount,
      note: this.state.comment,
      wallet_from_id: this.state.wallet_from_id,
      wallet_to_id: this.state.wallet_to_id,
      currency_from_type: this.state.currency_from_type,
      currency_to_type: this.state.currency_to_type,
      amount_to: this.state.amount_to
      // note: this.state.note
    };
    axios.post('/pay', payment)
      .then((response) => {
        this.setState({
          payeeUsername: '',
          amount: '',
          note: '',
          comment: '',
          paymentFail: false,
          emojis: [],
          amount_to: '',
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

  inputEmojiIntoTextField (emoji) {
    var myEmoji = emoji.currentTarget.getAttribute('name')
    var oldText = this.state.comment.split(' ');
    oldText[oldText.length- 1] = myEmoji
    this.setState({
      comment: oldText.join(' '),
      emojis: []
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
              name="comment"
              value={this.state.comment}
              hintText="What's it for?"
              floatingLabelText="Leave a comment"
              onChange={this.handleInputChanges.bind(this)}
            /><br />
              <Menu disableAutoFocus={true} onItemClick={this.inputEmojiIntoTextField.bind(this)}>
              {this.state.emojis.map ((emoji) => <MenuItem primaryText={emoji} name={emoji} value={emoji}/>)}
              </Menu> 
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