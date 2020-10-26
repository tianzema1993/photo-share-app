import React from 'react';
import {
  Typography, Grid, Menu, MenuItem, IconButton, Button, Dialog
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import PhotoScope from "./PhotoScope"
import { Link } from "react-router-dom";
import "./CustomMenu.css";
const axios = require('axios').default;

class customMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      dialogOpen: false,
      warnOpen: false,
      specifyPermit: false,
      users: [],
      permitUsers: []
    }
    axios.get("/user/others").then(
      response => {
        this.setState({users: response.data});
      }
    ).catch(err => console.log(err));
    
    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.openWarn = this.openWarn.bind(this);
    this.closeWarn = this.closeWarn.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.addPermit = this.addPermit.bind(this);
    this.dropPermit = this.dropPermit.bind(this);
    this.handleUploadButtonClicked = this.handleUploadButtonClicked.bind(this);
    this.logout = this.logout.bind(this);
    this.dropAccount = this.dropAccount.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentUser !== this.props.currentUser) {
      axios.get("/user/others").then(
        response => {
          this.setState({users: response.data, permitUsers: []});
        }
      ).catch(err => console.log(err));
  }
  }

  openMenu(event) {
    this.setState({anchorEl: event.currentTarget});
  }

  closeMenu() {
    this.setState({anchorEl: null});
  }

  openDialog() {
    this.setState({dialogOpen: true, anchorEl: null});
  }

  closeDialog() {
    this.setState({dialogOpen: false});
  }

  openWarn() {
    this.setState({warnOpen: true, anchorEl: null});
  }

  closeWarn() {
    this.setState({warnOpen: false});
  }

  handleCheck() {
    this.setState({specifyPermit: !this.state.specifyPermit});
  }

  addPermit(id) {
    let temp = this.state.permitUsers;
    temp.push(id);
    this.setState({permitUsers: temp});
  }

  dropPermit(id) {
    let temp = this.state.permitUsers;
    let result = temp.filter(userId => String(userId) !== String(id));
    this.setState({permitUsers: result});
  }

  //this function is called when user presses the update button
  handleUploadButtonClicked = (e) => {
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {

      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);
      domForm.append("specifyPermit", this.state.specifyPermit);
      domForm.append("permitUsers", JSON.stringify(this.state.permitUsers));
      axios.post('/photos/new', domForm)
        .then((res) => {
          console.log(res);
          this.setState({dialogOpen: false, specifyPermit: false, permitUsers: [this.props.currentUser._id]});
          window.location.href="#/photos/" + this.props.currentUser._id;
        })
        .catch(err => console.log(`POST ERR: ${err}`));
    }
  }

  logout() {
    this.setState({anchorEl: null, users: [], permitUsers: []});
    this.props.handleLogOut();
  }

  dropAccount() {
    let userId = this.props.currentUser._id;
    axios.post("/user/delete/" + userId, {}).then(
      () => {
        this.setState({warnOpen: false});
        this.logout();
        console.log("Successfully delete the user");
      }
    ).catch(err => console.log(err));
  }

  render() {
    return (
      <Grid container>
        <IconButton edge="end" color="inherit" aria-label="menu" onClick={this.openMenu} >
          <MenuIcon className="icon" />
          <Typography variant="h5">Menu</Typography>
        </IconButton>
        <Menu 
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          getContentAnchorEl={null}
          onClose={this.closeMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <MenuItem><Link className="menu-link" style={{ textDecoration: 'none' }} to={"/homepage"}>Go to Home</Link></MenuItem>
          <MenuItem onClick={this.openDialog}>Add photo</MenuItem>
          <MenuItem onClick={() => this.setState({anchorEl: null})}><Link className="menu-link" style={{ textDecoration: 'none' }} to={"/favorites"}>See my favorites</Link></MenuItem>
          <MenuItem onClick={this.openWarn}>Drop account</MenuItem>
          <MenuItem onClick={this.logout}>Logout</MenuItem>
        </Menu>
        <Dialog open={this.state.dialogOpen} onClose={this.closeDialog}>
          <form className="dialog">
            <input type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} />
            <br />
            <br />
            <label>
              Specify who can see the photo
              <input type="checkbox" onChange={this.handleCheck} checked={this.state.specifyPermit} />
            </label>
            <br />
            {this.state.specifyPermit ? this.state.users.map(user => {
              return <PhotoScope key={user._id} user={user} addPermit={this.addPermit} dropPermit={this.dropPermit} />
            }) : null}
            <br />
            <Button color="primary" variant="contained" onClick={this.handleUploadButtonClicked}>Upload</Button>
          </form>
        </Dialog>
        <Dialog open={this.state.warnOpen} onClose={this.closeWarn}>
            <div className="dialog">
              <Typography variant="h6">Warn: Do you want to drop your account?</Typography>
              <Typography><i>(This will erase your photos and comments as well)</i></Typography>
              <br />
              <Button variant="outlined" color="secondary" onClick={this.dropAccount} className="button">Yes, delete it</Button>
              <br />
              <br />
              <Button variant="outlined" color="primary" onClick={this.closeWarn} className="button">Cancel</Button>
            </div>
        </Dialog>
      </Grid>
    );
  }
}

export default customMenu;