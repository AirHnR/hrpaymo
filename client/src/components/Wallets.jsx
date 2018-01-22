import React from 'react';
import FlatButton from 'material-ui/FlatButton';

class Wallets extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wallets: [],
      currentWallet: {},
    };
    this.renderWallets.bind(this);
  }

  componentDidMount () {
    this.setState({
      wallets: this.props.wallets,
      // currentWallet: this.props.wallets[0]
    });
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.wallets !== nextProps.wallets) {
      this.setState({
        wallets: nextProps.wallets,
        currentWallet: nextProps.wallets[0]
      });
    }  
  } 

  // componentDidUpdate(prevProps, prevState) {
  //   if (prevState.wallets !== this.state.wallets) {
  //     this.setState ({
  //       currentWallet: this.state.wallets[0]  
  //     });
  //   }
  // }

  renderWallets () {
    return this.state.wallets.map((wallet, idx) => {
      return (
        <div key={idx} className='wallet-button'>
          <button 
            style={{width: 330 / this.state.wallets.length}}
            onClick={(e) => this.renderCurrentWallet(e.target.value)} 
            value={wallet.currency_type}>
            {wallet.currency_type}
          </button>
        </div>
      )
    });
  }

  renderCurrentWallet (currencyType) {
    let wallet = this.state.wallets.filter(wallet =>
      wallet.currency_type === currencyType
    )

    this.setState ({
      currentWallet: wallet[0]
    });
  }

  render () {
    return (
      <div className='wallet-wrapper'>
        <div id='my-wallet'>My Wallets</div>
        <div id='wallet-buttons'>
          {this.renderWallets()}
        </div>
        <div id='wallet-balance'>
          <span id='currency-type'>{this.state.currentWallet.currency_type}</span>
          <span id='amount'>{this.state.currentWallet.amount}</span>
        </div>
      </div>
    )
  }
}

export default Wallets;