import React from 'react';
import Avatar from 'material-ui/Avatar';
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';


const style = {
  card: {
    position: 'relative',
    width: '100%',
    display: 'inline-block',
    fontWeight: 700,
    fontSize: '18px',
  },
  title: {
    fontWeight: 700,
    fontSize: '20px',
    margin: '10px'
  },
  balance: {
    marginLeft: '125px',
    fontSize: '18px',
  }
};

class MiniProfile extends React.Component {
  constructor (props) {
    super(props);
  }

  render() {
    return (
      <div>
      <Paper className='feed-container' id='mini-profile'>
        <Card>
          <CardHeader
            title={
              <div>
                <span style={style.title}>{this.props.userInfo.displayName}</span>
              </div>
            }
            subtitle={
              <div className='member-tag'>
                <p>@{this.props.userInfo.username}</p>
                <p>{this.props.userInfo.email}</p>
              </div>
            }
            avatar={
              <Avatar 
                size={100} 
                src={this.props.userInfo.avatarUrl || '/images/no-image.gif'}
              />
            }
            />
        </Card>
      </Paper>
      </div>
    );
  }
}

export default MiniProfile;

