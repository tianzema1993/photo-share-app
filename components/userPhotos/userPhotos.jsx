import React from 'react';
import PhotoCard from "./PhotoCard";
//import fetchModel from "../../lib/fetchModelData";
import {
  Typography,
  Grid,
  MobileStepper,
  Button
} from "@material-ui/core";
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
const axios = require('axios').default;

/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: undefined,
      photos: undefined,
      favoriteList: undefined,
      activeStep: 0,
      maxSteps: 0
    }
    this.userId = this.props.match.params.userId;
    axios.get("/user/" + this.userId).then(
      response => {
        this.setState({
          user: response.data
        });
        this.props.changeView("Photos of", this.state.user.first_name, this.state.user.last_name);
      }
    ).catch(err => {
      console.log(err);
    });
    this.updatePhotos();
    this.updatePhotos = this.updatePhotos.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleBack = this.handleBack.bind(this);
  }

  updatePhotos() {
    axios.get("/photosOfUser/" + this.userId).then(
      response => {
        this.setState({photos: response.data, maxSteps: response.data.length});
      }
    ).catch(err => {
      console.log(err);
    });
    axios.get("/getFavorites/" + sessionStorage.getItem("userId")).then(
      response => {
        let favorite_ids = response.data.map(photo => photo._id);
        this.setState({favoriteList: favorite_ids});
      }
    ).catch(err => console.log(err));
  }

  handleNext() {
    this.setState({activeStep: this.state.activeStep + 1});
  }

  handleBack() {
    this.setState({activeStep: this.state.activeStep - 1});
  }

  render() {
    return this.state.user && this.state.favoriteList ? (
    <Grid container justify="space-evenly" alignItems="flex-start">
      <Grid item xs={12}>
        <Typography component={'span'} variant="h5">
          <i>{this.state.user.first_name} {this.state.user.last_name}&apos;s photos</i>
        </Typography>
        <br />
        <br />
      </Grid>
      {this.state.photos ?
        <Grid item xs={6}>
          {this.state.photos[this.state.activeStep] ?
            <PhotoCard 
              photo={this.state.photos[this.state.activeStep]}
              updatePhotos={this.updatePhotos}
              currentUser={this.props.currentUser}
              liked={this.state.photos[this.state.activeStep].likeUsers.includes(this.props.currentUser._id)}
              favorited={this.state.favoriteList.includes(this.state.photos[this.state.activeStep]._id)}
              activeStep={this.state.activeStep}
            /> : <div/>
          }
          {this.state.photos.length !== 0 ?
            <MobileStepper 
              steps={this.state.maxSteps}
              position="static"
              variant="text"
              activeStep={this.state.activeStep}
              nextButton={
                <Button size="small" onClick={this.handleNext} disabled={this.state.activeStep === this.state.maxSteps - 1}>
                  Next
                  <KeyboardArrowRight />
                </Button>
              }
              backButton={
                <Button size="small" onClick={this.handleBack} disabled={this.state.activeStep === 0}>
                  <KeyboardArrowLeft />
                  Back
                </Button>
              }
            /> : <div />
          }
        </Grid> : <div />}
    </Grid>
    ) : <div />}
}

export default UserPhotos;
