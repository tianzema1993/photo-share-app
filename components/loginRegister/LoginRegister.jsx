import React from 'react';
import { Grid, Typography, Button, TextField } from "@material-ui/core";
const axios = require('axios').default;

class LoginRegister extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName_register: "",
            userName_login: "",
            login_failed: "",
            register_failed: "",
            firstName: "",
            lastName: "",
            password_register: "",
            password_login: "",
            validate_password: "",
            password_different: false,
            location: "",
            description: "",
            occupation: ""
        }
        this.handleChange = this.handleChange.bind(this);
        this.retypePassword = this.retypePassword.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
    }

    handleChange(content) {
        this.setState(content);
    }

    retypePassword(event) {
        this.setState({validate_password: event.target.value});
        if (event.target.value === this.state.password_register) {
            this.setState({password_different: false});
        } else {
            this.setState({password_different: true});
        }
    }

    handleLogin(event) {
        event.preventDefault();
        axios.post("/admin/login", {
            login_name: this.state.userName_login,
            password: this.state.password_login
        }).then(
            response => {
                this.props.changeUser(response.data, "login");
            }
        ).catch(
            err => {
                this.setState({login_failed: err.response.data, userName_login: "", password_login: ""});   
            }
        );
    }

    handleRegister(event) {
        if (this.state.password_different) {
            this.setState({register_failed: "Please correct the error"});
            return
        } else {
            this.setState({register_failed: ""});
            event.preventDefault();
            axios.post("/user", {
                login_name: this.state.userName_register,
                password: this.state.password_register,
                first_name: this.state.firstName,
                last_name: this.state.lastName,
                location: this.state.location,
                description: this.state.description,
                occupation: this.state.occupation
            }).then(
                response => {
                    this.props.changeUser(response.data, "login");
                }
            ).catch(
                err => {
                    this.setState({register_failed: err.response.data});   
                }
            );
        }
    }

    render() {
        return (
            <Grid container justify="flex-start" spacing={5}>
                <Grid item xs={6}>
                <Typography variant="h5">
                    Sign In
                </Typography>
                <Typography variant="body1" color="error">
                    {this.state.login_failed}
                </Typography>
                <form onSubmit={this.handleLogin}>
                    <Grid container spacing={2} justify="center">
                        <Grid item xs={12}>
                            <TextField 
                                required
                                variant="outlined"
                                label="User Name"
                                type="text"
                                fullWidth
                                value={this.state.userName_login}
                                onChange={event => this.handleChange({userName_login: event.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                required
                                variant="outlined"
                                label="Password"
                                type="password"
                                fullWidth
                                value={this.state.password_login}
                                onChange={event => this.handleChange({password_login: event.target.value})}
                            />
                        </Grid>
                        <Button type="submit" color="primary" variant="contained">
                            Login
                        </Button>
                    </Grid>
                </form>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="h5">
                        Sign Up
                    </Typography>
                    <Typography variant="body1" color="error">
                        {this.state.register_failed}
                    </Typography>
                    <form onSubmit={this.handleRegister}>
                        <Grid container spacing={2} justify="flex-start">
                            <Grid item xs={6}>
                                <TextField 
                                    required
                                    variant="outlined"
                                    label="First Name"
                                    type="text"
                                    fullWidth
                                    value={this.state.firstName}
                                    onChange={event => this.handleChange({firstName: event.target.value})}
                                /> 
                            </Grid>
                            <Grid item xs={6}>
                                <TextField 
                                    required
                                    variant="outlined"
                                    label="Last Name"
                                    type="text"
                                    fullWidth
                                    value={this.state.lastName}
                                    onChange={event => this.handleChange({lastName: event.target.value})}
                                /> 
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    required
                                    variant="outlined"
                                    label="User Name"
                                    type="text"
                                    fullWidth
                                    value={this.state.userName_register}
                                    onChange={event => this.handleChange({userName_register: event.target.value})}
                                /> 
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    required
                                    variant="outlined"
                                    label="Password"
                                    type="password"
                                    fullWidth
                                    value={this.state.password_register}
                                    onChange={event => this.handleChange({password_register: event.target.value})}
                                /> 
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1" color="error">
                                    {this.state.password_different ? "Password doesn't match": null}
                                </Typography>
                                <TextField 
                                    required
                                    variant="outlined"
                                    label="Re-enter your password"
                                    type="password"
                                    fullWidth
                                    value={this.state.validate_password}
                                    onChange={event => this.retypePassword(event)}
                                /> 
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    variant="outlined"
                                    label="Location"
                                    type="text"
                                    fullWidth
                                    value={this.state.location}
                                    onChange={event => this.handleChange({location: event.target.value})}
                                /> 
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    variant="outlined"
                                    label="Description"
                                    type="text"
                                    fullWidth
                                    value={this.state.description}
                                    onChange={event => this.handleChange({description: event.target.value})}
                                /> 
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    variant="outlined"
                                    label="Occupation"
                                    type="text"
                                    fullWidth
                                    value={this.state.occupation}
                                    onChange={event => this.handleChange({occupation: event.target.value})}
                                /> 
                            </Grid>
                            <Grid container justify="center">
                                <Button type="submit" color="primary" variant="contained">
                                    Register Me
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
            </Grid>
        );
    }
}

export default LoginRegister;