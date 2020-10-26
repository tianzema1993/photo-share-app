import React from 'react';
import {
  Typography,
  Card,
  CardMedia,
      } from "@material-ui/core";
import Modal from 'react-modal';
import "./FavoriteCard.css"
const axios = require('axios').default;

class FavoriteCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false
    }
    this.deleteFavorite = this.deleteFavorite.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  deleteFavorite() {
    axios.post("/handleFavorite/" + this.props.userId, {photoId: this.props.photo._id, favorited: false}).then(
      this.props.updateFavorites()
    ).catch(err => console.log(err));
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  render() {
    return (
        <Card className="mention-card">
          <button className="small-button" onClick={() => this.deleteFavorite}>x</button>
          {/* <CardHeader action={<IconButton onClick={this.deleteFavorite}><ClearIcon /></IconButton>} /> */}
          <CardMedia onClick={this.openModal} component="img" image={"/images/" + this.props.photo.file_name} className="mention-photo" />
          <Modal isOpen={this.state.modalIsOpen} onRequestClose={this.closeModal} ariaHideApp={false} disableEnforceFocus>
            <Typography variant="h6">{new Date(Date.parse(this.props.photo.date_time)).toLocaleString()}</Typography>
            <img className="large-img" src={"/images/" + this.props.photo.file_name} onClick={this.closeModal} />
            <Typography variant="body1"><i>(Click the photo to quit the large view)</i></Typography>
          </Modal>
        </Card>
    );
  }
}

export default FavoriteCard;