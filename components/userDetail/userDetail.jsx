import React from 'react';
import './userDetail.css';
import { Link } from "react-router-dom";
//import fetchModel from "../../lib/fetchModelData";
import { Grid, Typography, Button } from "@material-ui/core";
import Mention from "./Mention";
const axios = require('axios').default;

/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: undefined
    }
    let userId = this.props.match.params.userId;
    axios.get("/user/" + userId).then(
      response => {
        this.setState({user: response.data});
        this.props.changeView("Details of", this.state.user.first_name, this.state.user.last_name);
      }
    ).catch(err => {
      console.log(err);
    });
    
    /*
    let promise = fetchModel("/user/" + userId);
    promise.then(response => {
      this.setState({user: response.data});
      this.props.changeView("Details of", this.state.user.first_name, this.state.user.last_name);
    });
    */
  }

  // run every time after component has been updated. Without this, the view won't be updated when switching users
  componentDidUpdate() {
    let newId = this.props.match.params.userId;
    if (this.state.user && newId !== this.state.user._id) {
      axios.get("/user/" + newId).then(
        response => {
          this.setState({user: response.data});
          this.props.changeView("Details of", this.state.user.first_name, this.state.user.last_name);
        }
      ).catch(err => {
        console.log(err);
      });
    }
  }

  render() {
    return this.state.user ? (
      <div>
        <Grid container alignItems="center" justify="space-evenly">
          <Grid xs={6} item>
            <Typography variant="body1"><i>1. What&apos;s your name?</i></Typography>
            <Typography variant="h6">
              {this.state.user.first_name} {this.state.user.last_name}
            </Typography>
            <Typography variant="body1"><i>2. What&apos;s your job?</i></Typography>
            <Typography variant="h6">
              {this.state.user.occupation}
            </Typography>
            <Typography variant="body1"><i>3. Where are you from?</i></Typography>
            <Typography variant="h6">
              {this.state.user.location}
            </Typography>
            <Typography variant="body1"><i>4. Describe yourself.</i></Typography>
            <Typography variant="h6">
              {this.state.user.description}
            </Typography>
          </Grid>
          <Grid xs={4} item>
            <Button variant="outlined" size="large" color="primary">
              <Link to={"/photos/" + this.state.user._id} className="photoLink">See photos</Link>
            </Button>
          </Grid>
        </Grid>
        <br />
        <Typography variant="h5"><i>Notifications: </i></Typography>
        <br />
        <Grid container justify="space-around">
          {this.state.user.mentioned.length > 0 ? this.state.user.mentioned.map((photoId, index) => {
            return <Grid xs={2} key={index} item><Mention photoId={photoId} currentUser={this.props.currentUser} /></Grid>
          }) : <Typography variant="h6">No one mentions {this.state.user.first_name} {this.state.user.last_name}</Typography>}
        </Grid>
      </div>
    ) : (<div />);
  }
}

export default UserDetail;
