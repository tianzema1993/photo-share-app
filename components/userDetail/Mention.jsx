import React from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
        } from "@material-ui/core";
import { Link } from "react-router-dom";
import "./Mention.css"
const axios = require('axios').default;

class Mention extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            photo: undefined,
            scope: undefined
        }

        axios.get("/photo/" + this.props.photoId).then(
            response => {
                this.setState({photo: response.data});
            }
        ).then(
            () => {
                let permission = this.state.photo.permission;
                let id = this.props.currentUser._id;
                let temp = permission.includes(id);
                this.setState({scope: temp});
            }
        ).catch(err => {console.log(err);});
    }

    render() {
        return this.state.photo && (!this.state.photo.specifyPermit || this.state.scope) ? (
            <Card className="mention-card">
                <CardContent>
                    <Link to={"/users/" + this.state.photo.userId}>{this.state.photo.userName}</Link>
                </CardContent>
                <Link to={"/photos/" + this.state.photo.userId}>
                    <CardMedia component="img" image={"/images/" + this.state.photo.file_name} className="mention-photo" />
                </Link>
            </Card>
        ) : <Typography>limitted access</Typography>;
    }
}

export default Mention;