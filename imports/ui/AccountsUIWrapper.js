import React, { Component } from "react";
import { Template } from "meteor/templating";
import { Blaze } from "meteor/blaze";

export default class AccountsUIWrapper extends Component {
  constructor(props) {
    super(props);

    this.loginRef = null;
    this.setLoginRef = element => (this.loginRef = element);
  }

  componentDidMount() {
    // Use Meteor Blaze to render login buttons
    this.view = Blaze.render(Template.loginButtons, this.loginRef);
  }
  componentWillUnmount() {
    // Clean up Blaze view
    Blaze.remove(this.view);
  }
  render() {
    // Just render a placeholder container that will be filled in
    return <span ref={this.setLoginRef} />;
  }
}
