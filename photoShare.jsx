import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid
} from '@material-ui/core';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from "./components/loginRegister/LoginRegister";
import UserFavorite from "./components/userFavorite/userFavorite";
import Home from "./components/Home/Home";

const axios = require('axios').default;

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: "Home",
      currentUser: undefined,
      userId: sessionStorage.getItem("userId"),
    }
    if (this.state.userId) {
      axios.get("/user/" + this.state.userId).then(
        response => {
          this.setState({currentUser: response.data});
        }
      ).catch(err => console.log(err));
    }
    this.changeView = this.changeView.bind(this);
    this.changeUser = this.changeUser.bind(this);
  }

  changeView(loc, firstName, lastName) {
    this.setState({view: loc + " " + firstName + " " + lastName});
  }

  changeUser(newUser, type) {
    this.setState({currentUser: newUser});
    if (type === "login") {
      this.setState({
        userId: newUser._id,
      });
      sessionStorage.setItem("userId", newUser._id);
      axios.get("/user/" + this.state.userId).then(
        response => {
          this.setState({currentUser: response.data});
        }
      ).catch(err => console.log(err));
    } else if (type === "logout") {
      sessionStorage.clear();
      this.setState({
        userId: undefined,
        view: "Home"
      });
    }
  }

  render() {
    return (
      <HashRouter>
      <div>
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <TopBar changeUser={this.changeUser} view={this.state.view} currentUser={this.state.currentUser} />
        </Grid>
        <div className="cs142-main-topbar-buffer"/>
          <Grid item sm={3}>
            <div>
              {this.state.userId ? <UserList /> : (
                <Redirect path="/" to="/login-register" />
              )}
            </div>
          </Grid>
          <Grid item sm={9}>
            <div className="cs142-main-grid-item">
              <Switch>
                {this.state.userId ? (<Route path="/users/:userId"
                  render={ props => <UserDetail {...props} changeView={this.changeView} currentUser={this.state.currentUser} /> }
                />) : (
                        <Redirect path="/users/:userId" to="/login-register" />
                    )}
                {this.state.userId ? (<Route path="/photos/:userId"
                  render ={ props => <UserPhotos {...props} changeView={this.changeView} currentUser={this.state.currentUser} /> }
                />) : (
                        <Redirect path="/photos/:userId" to="/login-register" />
                )}
                {this.state.userId ? (<Route path="/favorites"
                  render ={ props => <UserFavorite {...props} changeView={this.changeView} userId={this.state.userId} /> }
                />) : (
                        <Redirect path="/favorite/:userId" to="/login-register" />
                )}
                {this.state.userId ? (<Route path="/homepage" render={props => <Home {...props} changeView={this.changeView} />} />
                ) : (
                        <Redirect path="/favorite/:userId" to="/login-register" />
                )}
                {!this.state.userId ? (<Route path="/login-register"
                  render ={ props => <LoginRegister {...props} changeUser={this.changeUser} /> }
                />) : (<Redirect path="/login-register" to="/homepage" />)}

              </Switch>
              </div>
          </Grid>
        </Grid>
      </div>
    </HashRouter>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
