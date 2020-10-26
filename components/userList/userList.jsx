import React from 'react';
import { Link } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemText,
  Divider
}
from '@material-ui/core';
import './userList.css';
//import fetchModel from "../../lib/fetchModelData";
const axios = require('axios').default;

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: undefined
    }
    axios.get("/user/list").then(response => {
      this.setState({users: response.data})
    }).catch(err => {
      console.log(err);
    });
    /*
    // get user list data when the class is constructed and set the state
    let promise = fetchModel("/user/list");
    promise.then(response => {
      this.setState({users: response.data})
    });
    */
  }

  render() {
    return this.state.users ? (
      <div>
        <h3 className="listTitle">My friends:</h3>
        <List component="nav">
          {this.state.users.map(user => {
            return (
              <Link key={user._id} to={"/users/" + user._id} className="nav-link">
                <ListItem>
                  <ListItemText primary={user.first_name + " " + user.last_name} />
                </ListItem>
                <Divider />
              </Link>
            );
          })}
        </List>
      </div>
    ) : (<div />);
  }
}

export default UserList;
