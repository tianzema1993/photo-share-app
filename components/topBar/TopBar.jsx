import React from 'react';
import {
  AppBar, Toolbar, Typography, Grid
} from '@material-ui/core';
import './TopBar.css';
//import fetchModel from "../../lib/fetchModelData";
import CustomMenu from "./CustomMenu"
const axios = require('axios').default;

class TopBar extends React.Component {
/**
 * Define TopBar, a React componment of CS142 project #5
 */
  constructor(props) {
    super(props);
    this.state = {
      view: this.props.view,
    }

    this.handleLogOut = this.handleLogOut.bind(this);
  }

  componentDidUpdate() {
    if (this.state.view !== this.props.view) {
      this.setState({ view: this.props.view });
    }
  }

  handleLogOut() {
    this.props.changeUser(undefined, "logout");
    axios.post("/admin/logout", {}).then(
      () => {
        console.log("Successfully log out");
      }
    ).catch(err => {
      console.log(err);
    });
  }

  render() {
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          {this.props.currentUser ?
          (<Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <Grid item>
              <Typography variant="h5" color="inherit">
                Hi {this.props.currentUser.first_name}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="h5">{this.state.view}</Typography> 
            </Grid>
            <Grid item>
              <CustomMenu currentUser={this.props.currentUser} handleLogOut={this.handleLogOut} />
            </Grid>
          </Grid>) : (<Typography variant="h5">Please login</Typography>)}
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
