import React from 'react';
import { Link } from "react-router-dom";
import {
    Typography,
    Grid,
    Card,
    CardHeader,
    CardMedia,
    CardContent,
    CardActions, 
    Button, 
    IconButton,
    Divider
        } from "@material-ui/core";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ClearIcon from '@material-ui/icons/Clear';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { MentionsInput, Mention } from 'react-mentions';
import "./PhotoCard.css"
import mentionStyle from "./mentionStyle";

const axios = require('axios').default;

class PhotoCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newComment: "",
            commentFailed: "",
            extended: false,
            users: undefined,
            mentionList: [],
            liked: props.liked,
            numOfLike: props.photo.likeUsers.length,
            favorited: props.favorited
        }
        this.permission = this.props.photo.permission;
        this.id = this.props.currentUser._id;
        this.scope = this.permission.includes(this.id);
        axios.get("/users/mention").then(response => {this.setState({users: response.data})}).catch(err => {console.log(err)});
        this.handleExtended = this.handleExtended.bind(this);
        this.editComment = this.editComment.bind(this);
        this.addComment = this.addComment.bind(this);
        this.deleteComment = this.deleteComment.bind(this);
        this.deletePhoto = this.deletePhoto.bind(this);
        this.likePhoto = this.likePhoto.bind(this);
        this.favoritePhoto = this.favoritePhoto.bind(this);
    }

    handleExtended() {
        this.setState({extended: true});
    }
    
    editComment(event) {
        this.setState({newComment: event.target.value});
    }

    addComment(event, photoId) {
        event.preventDefault();
        axios.post("/commentsOfPhoto/" + photoId, {comment: this.state.newComment, mentionUsers: this.state.mentionList}).then(
            () => {
                this.setState({newComment: "", extended: false, commentFailed: "", mentionList: []});
                this.props.updatePhotos();
            }
        ).catch(err => {
            this.setState({commentFailed: err.response.data});
        })
    }

    deleteComment(commentId) {
        let photoId = this.props.photo._id;
        axios.post("/comment/delete/" + commentId, {photoId: photoId}).then(
            this.props.updatePhotos()
        ).catch(err => console.log(err));
    }

    deletePhoto(photoId) {
        axios.post("/photo/delete/" + photoId, {}).then(
            () => {
                this.props.updatePhotos();
            }
        ).catch(err => console.log(err));
    }

    likePhoto() {
        axios.post("/photo/like/" + this.props.photo._id, {liked: this.state.liked}).then(
            () => {
                this.setState({numOfLike: this.state.liked ? this.state.numOfLike - 1 : this.state.numOfLike + 1, liked: !this.state.liked});
                this.props.updatePhotos();
            }
        ).catch(err => console.log(err));
    }

    favoritePhoto() {
        axios.post("/handleFavorite/" + this.props.currentUser._id, {photoId: this.props.photo._id, favorited: true}).then(
            this.setState({favorited: true})
        ).catch(err => console.log(err));
    }

    componentDidUpdate(prevProps) {
        if (prevProps.activeStep !== this.props.activeStep) {
            this.setState({newComment: "", extended: false, commentFailed: "", mentionList: [], liked: this.props.liked, favorited: this.props.favorited, numOfLike: this.props.photo.likeUsers.length,});
        }
    }

    render() {
        return ((!this.props.photo.specifyPermit) || this.state.scope) ? (
            <Card className="photo-card">
                <CardHeader className="title" title={new Date(Date.parse(this.props.photo.date_time)).toLocaleString()}
                    action={this.props.photo.user_id === this.props.currentUser._id ?
                    <IconButton size="small" onClick={() => this.deletePhoto(this.props.photo._id)}><ClearIcon /></IconButton> : null
                    } />
                <CardMedia component="img" image={"/images/" + this.props.photo.file_name} className="img" />
                <div className="icons">
                    <CardActions>
                        <IconButton onClick={this.likePhoto}>
                            <ThumbUpIcon color={this.state.liked ? "primary" : "inherit"} />
                        </IconButton>
                        <Typography>{this.state.numOfLike}</Typography>
                        <IconButton disabled={this.state.favorited} onClick={this.favoritePhoto}>
                            <FavoriteIcon color={this.state.favorited ? "secondary" : "inherit"} />
                        </IconButton>
                    </CardActions>
                </div>
                <CardContent className="photo-card-content">
                    <Divider />
                    {this.props.photo.comments ? this.props.photo.comments.map(comment => (
                        <Grid container key={comment._id}>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="textPrimary" display="inline">
                                    <Link to={"/users/" + comment.user._id} className="namelink">
                                        <i>{comment.user.first_name} {comment.user.last_name}</i>
                                    </Link>
                                    {"  "}  {comment.comment}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container justify="space-between" alignItems="center">
                                    <Typography variant="body2" color="textSecondary">
                                        <i>{new Date(Date.parse(comment.date_time)).toLocaleString()}</i>
                                    </Typography>
                                        {comment.user._id === this.props.currentUser._id ? <button className="small-button" onClick={() => this.deleteComment(comment._id)}>x</button> : null}
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                        </Grid>
                    )): <div/>}
                    <div className="newComment">
                        <Typography variant="body1" color="error">
                            {this.state.commentFailed}
                        </Typography>
                        <form onSubmit={(event) => this.addComment(event, this.props.photo._id)}>
                            <MentionsInput 
                                value={this.state.newComment} 
                                onChange={this.editComment} 
                                allowSuggestionsAboveCursor 
                                style={mentionStyle} 
                                singleLine={this.state.extended ? false : true}
                                onClick={this.handleExtended}
                            >
                                <Mention 
                                    trigger="@" 
                                    data={this.state.users} 
                                    displayTransform={(id, display) => ("@" + display)} 
                                    appendSpaceOnAdd
                                    markup="@__display__"
                                    onAdd={(id) => {
                                        let temList = this.state.mentionList;
                                        temList.push(id);
                                        this.setState({mentionList: temList});
                                    }}
                                />
                            </MentionsInput>
                            <Button type="submit" color="primary">Add Comment</Button>
                        </form>
                    </div>
                </CardContent>
          </Card>
        ) : null;
    }
}

export default PhotoCard;