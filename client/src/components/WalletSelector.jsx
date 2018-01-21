import React, {Component} from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import _ from 'underscore';

const wallets = {
  'USD': 'US Dollar',
  'CAD': 'Canadian Dollar',
  'EUR': 'Euro',
  'ARS': 'Argentine Peso',
  'BTC': 'Bit Coin'
};

/**
 * `SelectField` can handle multiple selections. It is enabled with the `multiple` property.
 */
export default class WalletSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: [],
    };
  }

  handleChange (event, index, values) {
    Promise.resolve(this.setState({values}))
    .then(() => this.props.getWallets(this.state.values));
  };

  menuItems(values) {
    return _.map(wallets, (wallet, key) => (
      <MenuItem
        key={key}
        insetChildren={true}
        checked={values && values.indexOf(wallet) > -1}
        value={key}
        primaryText={wallet}
      />
    ));
  }

  render() {
    const {values} = this.state;
    return (
      <SelectField
        multiple={true}
        hintText="Select your wallets"
        value={values}
        onChange={this.handleChange.bind(this)}
      >
        {this.menuItems(values)}
      </SelectField>
    );
  }
}