import React from 'react';
import {
  Typography,
  Grid
} from "@material-ui/core";
import FavoriteCard from "./FavoriteCard"
const axios = require('axios').default;

class UserFavorite extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: undefined
    }
    this.updateFavorites()
    this.updateFavorites = this.updateFavorites.bind(this);
  }

  updateFavorites() {
    axios.get("/getFavorites/" + this.props.userId).then(
      response => {
        this.setState({photos: response.data});
        this.props.changeView("My favorite photos:", "", "");
      }
    ).catch(err => console.log(err));
  }

  render() {
    return this.state.photos ? (
      <Grid container justify="space-evenly" alignItems="flex-start">
        {this.state.photos.length !== 0 ? this.state.photos.map(photo => (
          <Grid key={photo._id} item xs={3}>
            <FavoriteCard photo={photo} updateFavorites={this.updateFavorites} userId={this.props.userId} />
          </Grid>
        )) : <Typography variant="h6"><i>You don&apos;t have any favorite photos</i></Typography>}
      </Grid>
    ) : null;
  }
}

export default UserFavorite;