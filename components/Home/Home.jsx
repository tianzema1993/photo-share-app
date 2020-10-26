import React from 'react';
import {
  Typography
      } from "@material-ui/core";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.props.changeView("Home", "", "");
  }

  render() {
    return (
      <div>
        <Typography variant="h6">
          Welcome to the Photo Share App, click any user in the left bar to start.
        </Typography>
        <ol>
          <li>
          <Typography>Click the user name in the left will navigate you to the user&apos;s detail page, this will include the information about that user. In the bottom, notification list will show up if other users mentioned the user.</Typography>
          </li>
          <li>
            <Typography>Each item in the @mention list should include:</Typography>
            <ul>
              <li>
                A small thumbnail of the photo. Clicking on the photo should link to the location of the photo on the user’s photo page.
              </li>
              <li>
                The photo owner&apos;s name. Clicking on the owner&apos;s name should link to the owner&apos;s user detail page.
              </li>
            </ul>
          </li>
          <li>
          <Typography>Click on <i>See Photos</i> to go to user&apos;s photo page.</Typography>
          </li>
          <li>
          <Typography>The most recent photo of the user will show up first, you can use the stepper to move forward or back.</Typography>
          </li>
          <li>
            <Typography>In the photo page, you can:</Typography>
            <ul>
              <li>
                <i>Like</i> and <i>Favorite</i> the photo, the number tells how many users liked this photo. You can always unlike it, but you can only unfavorite the photo in your favorite photos page. 
              </li>
              <li>
                See other people&apos;s comment, you can click the name of the comment to go to that user&apos;s detail page.
              </li>
              <li>
                Click on the text-area to add a new comment. You can delete your own comment using the little &quot;x&quot; in the right.
              </li>
            </ul>
          </li>
          <li>
          <Typography>Click on the <i>Menu</i> button in the top-bar, you will have the following options:</Typography>
            <ul>
              <li>
                Go back to the home page to see the instructions.
              </li>
              <li>
                Add your own photo. You can specify who can see your photo. If you don&apos;t specify, the photo will be visible to everyone.
              </li>
              <li>
                See your favorite photos. You can easily unfavorite the photo by clicking the &quot;x&quot; in the left. Also, clicking on the thumbnail photo will open a big view of that photo.
              </li>
              <li>
                Drop your account. This will erase everything like you never registered before.
              </li>
              <li>
                Logout the app.
              </li>
            </ul>
          </li>
        </ol>
        <Typography variant="h6">Thanks for trying!</Typography>
      </div>
    );
  }
}

export default Home;