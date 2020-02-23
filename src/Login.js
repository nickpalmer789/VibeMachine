import React from 'react';

class Login extends React.Component {
    constructor(props) {
        //Get the props from the parent component
        super(props);

        //The local state for this component
        this.state = {
            loggedIn: false, //Whether the user has given a token for this session
            token: "", //The user's token for this session
            clientID: "4b01d4848349477e905afb4fd80ed5c5",
            redirectURL: "http://localhost:3000/vibe"
        };
    }

    handleLogin() {
        var scopes = "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state";
        window.location.replace('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + this.state.clientID +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(this.state.redirectURL));
    }

    render() {
        return (
            <button onClick={() => this.handleLogin()}>Login to make some vibes</button>
        );
    }
}

export default Login;
