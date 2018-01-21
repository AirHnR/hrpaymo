import React, {Component} from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

export default class PayeeWallets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
    };
    this.renderSelect.bind(this);
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (prevProp.wallets !== this.props.wallets) {
  //     this.setState({
  //       value: this.props.wallets
  //     })
  //   }
  // }

  handleChange (event, index, value) {
    this.setState({
      value: value,
    });
    this.props.updateState('currency_to_type', value);
    let walletId = this.props.wallets[index].bal_id;
    this.props.updateState('wallet_to_id', walletId);
  } 

  renderSelect () {
    return this.props.wallets.map(wallet => {
      return (
        <MenuItem 
        key={wallet.bal_id}
        value={wallet.currency_type} 
        primaryText={wallet.currency_type} 
        />
      )
    })
  }

  render() {
    return (
      <div>
        <SelectField
          floatingLabelText="Select payee account"
          value={this.state.value}
          onChange={this.handleChange.bind(this)}
        >
        {this.renderSelect()}
        </SelectField>
      </div>
    );
  }
}