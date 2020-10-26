import React from 'react';

class PhotoScope extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false
    }
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange() {
    if (this.state.checked) {
      this.props.dropPermit(this.props.user._id);
    } else {
      this.props.addPermit(this.props.user._id);
    }
    this.setState({checked: !this.state.checked});
  }

  render() {
    return this.props.user ? (
      <label>
        {this.props.user.first_name + " " + this.props.user.last_name}
        <input type="checkbox" checked={this.state.checked} onChange={this.handleChange} />
        <br />
      </label>
    ) : null;
  }
}

export default PhotoScope;