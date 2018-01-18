import React, { Component } from 'react';
import axios from 'axios';
import FriendList from './ChatFriendList.jsx';
import {ChatMessages, ChatBox} from './ChatMessages.jsx';
import Navbar from './Navbar.jsx';
import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:3000');

const fakeData = [
  {
    friend: {
      username: 'cody', 
      imageUrl: 'image'
    },
    messages: [
      {
        sender: 'cody',
        reciever: 'newguy',
        message: 'Hello newguy'
      },
      {
        sender: 'newguy',
        reciever: 'cody',
        message: 'Hello cody'
      }
    ]
  },
  {
    friend: {
      username: 'cherry', 
      imageUrl: 'image'
    },
    messages: [
      {
        sender: 'cherry',
        reciever: 'blam92',
        message: 'Hello blam92 I am cherry'
      },
      {
        sender: 'blam92',
        reciever: 'cherry',
        message: 'oh hi!'
      }
    ]
  },
  {
    friend: {
      username: 'jarrod', 
      imageUrl: 'image'
    },
    messages: [
      {
        sender: 'blam92',
        reciever: 'jarrod',
        message: 'Hello jarrod! u there?'
      },
      {
        sender: 'jarrod',
        reciever: 'blam92',
        message: 'Hello jarrod! u there?'
      }
    ]
  }
] 

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gridTemplateRows: '1fr',
    gridTemplateAreas: "'friendList chat'",
  },

  friendList: {
    gridArea: 'friendList'
  },
  chat: {
    display: 'grid',
    gridArea: 'chat',
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr 100px',
    gridTemplateAreas: "'messageBox' 'chatBox'"
  },
  messageBox: {
    gridArea: 'messageBox'
  },
  chatBox: {
    gridArea: 'chatBox'
  }
};

class Chat extends Component {

  constructor(props) {
    super(props);
    this.state = {
      users: [],
      chats: fakeData,
      onlineUsers: [],
      currentChatData: {
        friend: {
          username: '', 
          imageUrl: ''
        },
        messages: []
      },
      notifications: {}
    }
    this.sendMessage = this.sendMessage.bind(this);
    this.openChatWithFriend = this.openChatWithFriend.bind(this);
  }
  componentDidMount() {
    this.getUsers();
    socket.on('chat', (chatData) => {
      this.updateChats(chatData.message, chatData.friendId, chatData.friendUsername);
    });
    socket.on('user disconnect', (onlineUsers) => {
      this.setState({
        onlineUsers: onlineUsers
      })
    });
    socket.on('user connect', (users) => {
      this.setState({
        onlineUsers: users
      });
    })
    socket.emit('user connect', this.props.userInfo);
  }

  getUsers() {
    axios('/usernames', { params: { userId: this.props.userInfo.userId }})
    .then(response => {
      this.setState({
        users: response.data.usernames
      });
    })
    .catch(err => {
      console.error(err);
    })
  }

  sendMessage(message) {
    socket.emit('chat', {
      newMessage: message,
      receiverInfo: this.state.currentChatData.friend,
      senderId: this.props.userInfo.userId,
      senderUsername: this.props.userInfo.username
    });
    this.updateChats(message, this.state.currentChatData.friend.id);

    this.postMessage(this.props.userInfo.username, this.state.currentChatData.friend.username, message)
    .then((res) => {
      console.log('message has been posted', res);
    }).catch((err) => {
      console.log('error posting message', err);
    })

  }
  updateChats(message, friendId, friendUsername) {
    //check if the user who sent the message is currently being displayed.
    if(this.state.currentChatData.friend.id === friendId) {
      let updatedData = Object.assign({}, this.state.currentChatData);
      updatedData.messages.push({
        sender_id: this.state.currentChatData.friend.id,
        receiver_id: this.props.userInfo.userId,
        chat: message
      });
  
      this.setState({
        currentChatData: updatedData
      });
    } else {
      let notifications = Object.assign({}, this.state.notifications);
      notifications[friendUsername] = notifications[friendUsername]++ || 1;
      this.setState({
        notifications: notifications
      });
    }
  }

  openChatWithFriend(friendUsername) {
    let notifications = Object.assign({}, this.state.notifications);
    delete notifications[friendUsername]

    this.getChatHistory(friendUsername, (data) => {
      this.setState({
        currentChatData: data,
        notifications: notifications
      })
    });
  }

  getChatHistory(friendName, cb) {
    axios('/messages', { params: { currentUser: this.props.userInfo.username, friend: friendName }})
    .then(response => {
      cb(response.data);
    })
    .catch(err => {
      console.error(err);
    })
  }

  postMessage(sender, receiver, message) {
    return axios.post('/messages', {
      sender: sender,
      receiver: receiver,
      chat: message
    });
  }

  render() {
    return (
      <div>
        <Navbar 
        isLoggedIn={this.props.isLoggedIn} 
        logUserOut={this.props.logUserOut}
        />
        <div style={styles.container}>
          <div style={styles.friendList} className="friend-list">
            <FriendList friends={this.state.onlineUsers} 
            users={this.state.users} notifications={this.state.notifications} openChat={this.openChatWithFriend}/>
          </div>
          <div style={styles.chat} className="chat">
            <div style={styles.messageBox} className="messagebox">
              <ChatMessages chats={this.state.currentChatData} 
              userAvatar={this.props.userInfo.avatarUrl} currentUserId={this.props.userInfo.userId}/>
            </div>
            <div style={styles.chatBox} className="chatbox">
              <ChatBox sendMessage={this.sendMessage}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Chat;