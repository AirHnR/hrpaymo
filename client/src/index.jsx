// ---------- Packages ---------- //
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import $ from 'jquery';
import axios from 'axios';

// ---------- Material UI ---------- //
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';



// ---------- Componenets ---------- //
import LoggedOutHome from './components/LoggedOutHome.jsx';
import Home from './components/Home.jsx';
import Login from './components/Login.jsx';
import SignUp from './components/SignUp.jsx';
import Profile from './components/Profile.jsx';
import Navbar from './components/Navbar.jsx';
import Chat from './components/Chat.jsx';
import DataAnalytics from './components/DataAnalytics.jsx'

// ---------- Helper ---------- //
import feedManipulation from './feedManipulation.js'

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#3D95CE',
  },
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      isLoggedIn: false,
      globalFeed: {},
      userFeed: {},
      balance: null,
      userInfo: {},
      wallets: []
    }
    this.logUserOut = this.logUserOut.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.userInfo !== this.state.userInfo) {
      this.getWallets();
    }
    if (prevState.userFeed !== this.state.userFeed) {
      this.getWallets();
    }
  }

  loadUserData(userId) {
    this.getUserInfo(userId);
    this.getBalance(userId);
    this.getFeed('globalFeed', userId);
    this.getFeed('userFeed', userId);
  }

  refreshUserData(userId) {
    this.getBalance(userId);
    this.getWallets(userId);
    this.getFeed('globalFeed', userId, this.state.globalFeed.newestTransactionId || null);
    this.getFeed('userFeed', userId, this.state.userFeed.newestTransactionId || null);
  }

  getWallets (userId) {
    axios('/wallets', {params: {userId: userId}})
    .then((response) => {
      this.setState({
        wallets: response.data
      });
    })
    .catch((err) =>{
      console.error('get wallet error:', err);
    });
  }

  getFeed(feedType, userId = null, sinceId) {
    let endpoint = feedManipulation.returnFeedEndpoint(feedType, userId);

    let params = {
      sinceId: sinceId,
      userId: userId
    }

    axios(endpoint, {params: params})
      .then((response) => {
        this.prependNewTransactions(feedType, response.data);
      })
      .catch((err) => {
        console.error('get feed error:', err);
      });
  }

  prependNewTransactions(feedType, transactionSummary) {
    // If no results return, do nothing
    if (!transactionSummary || transactionSummary.count === 0) {
      return;
    }

    // If feed was empty, set the returned transactions as the feed
    let isFeedEmpty = !this.state[feedType].count || this.state[feedType].count === 0;

    let newFeedObject = isFeedEmpty
      ? transactionSummary
      : feedManipulation.mergeFeeds(transactionSummary, this.state[feedType]);

    this.setState({
      [feedType]: newFeedObject
    })
  }

  loadMoreFeed(feedType, userId) {
    let endpoint = feedManipulation.returnFeedEndpoint(feedType, userId);

    // Send along the next valid ID you'd like returned back
    // from the database
    let params = {
      beforeId: this.state[feedType].nextPageTransactionId
    }

    axios(endpoint, {params: params})
      .then((response) => {

        // Confirm there additional items to load
        if (response.data && response.data.count > 0) {
          let combinedItems = feedManipulation.mergeFeeds(this.state[feedType], response.data);

          this.setState({
            [feedType]: combinedItems
          })
        }
      })
      .catch((err) => {
        console.error(err);
      }); 
  }

  getBalance(userId) {
    axios('/balance', {params: {userId: userId}})
      .then((response) => {
        this.setState({
          balance: response.data.amount
        });
      })
      .catch((err) =>{
        console.error(err);
      });
  }

  getUserInfo(userId) {
    axios('/profile', {params: {userId: userId}})
      .then((response) => {
        this.setState({
          userInfo: response.data
        });
        localStorage.setItem('user', JSON.stringify(response.data));
      })
      .catch((err) =>{
        console.error('get userinfo error:', err);
      });
  }

  logUserIn(userId) {
    // set the userId in the userInfo object as soon as the user logs in
    var obj = this.state.userInfo;
    obj.userId = userId;
    this.setState({
      isLoggedIn: true,
      userInfo: obj
    })
    this.loadUserData(userId);
    this.getWallets(userId);
  }

  logUserOut() {
    this.setState({
      isLoggedIn: false,
      globalFeed: {},
      userFeed: {},
      balance: null,
      userInfo: {}
    })
  }

  render () {
    const HomeWithProps = (props) => {
      return (
        <div>
          {!this.state.isLoggedIn 
            ? <LoggedOutHome 
                isLoggedIn={this.state.isLoggedIn} 
                logUserOut={this.logUserOut.bind(this)}
                {...props}
              />
            : <Home
                refreshUserData={this.refreshUserData.bind(this)}
                isLoggedIn={this.state.isLoggedIn} 
                logUserOut={this.logUserOut.bind(this)}
                userFeed={this.state.userFeed} 
                loadMoreFeed={this.loadMoreFeed.bind(this)}
                globalFeed={this.state.globalFeed}
                userInfo={this.state.userInfo}
                balance={this.state.balance}
                wallets={this.state.wallets}
                {...props}
              />
          }
        </div>
      );
    };

    const ProfileWithProps = (routeProps) => {
      return (
        <div>
          {!this.state.isLoggedIn 
            ? <LoggedOutHome 
                isLoggedIn={this.state.isLoggedIn} 
                logUserOut={this.logUserOut.bind(this)}
                {...routeProps}
              />
            : <Profile 
                key={routeProps.location.pathname}
                refreshUserData={this.refreshUserData.bind(this)}
                isLoggedIn={this.state.isLoggedIn} 
                logUserOut={this.logUserOut.bind(this)}
                userInfo={this.state.userInfo}
                wallets={this.state.wallets}
                {...routeProps} 
              />
          }
        </div>
      );
    };

    const UserAnalytics = (props) => {
      console.log('rendering useranalytics')
      return (
        <DataAnalytics
          isLoggedIn={this.state.isLoggedIn} 
          logUserOut={this.logUserOut.bind(this)}        
          userInfo={this.state.userInfo}
          {...props}
          />
        )
    }


    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <BrowserRouter>
          <Switch>
          <Route 
              exact path="/chat"  
              render={routeProps => <Chat {...routeProps} userInfo={this.state.userInfo} 
              isLoggedIn={this.state.isLoggedIn} logUserOut={this.logUserOut}/>}
            />
            <Route 
              exact path="/signup" 
              render={routeProps => <SignUp {...routeProps} logUserIn={this.logUserIn.bind(this)} />} 
            />
            <Route 
              exact path="/login" 
              render={routeProps => <Login {...routeProps} getWallets={this.getWallets.bind(this)} logUserIn={this.logUserIn.bind(this)} />} 
            />
            <Route
            exact path="/userAnalytics"
            render={UserAnalytics}
            />
            <Route 
              path="/:username"
              onEnter={ this.requireAuth }
              render={ProfileWithProps}
            />
            <Route 
              path="/" 
              render={HomeWithProps} 
            />
          </Switch>
        </BrowserRouter>
      </MuiThemeProvider>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
