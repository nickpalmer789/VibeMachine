import SpotifyPlayer from 'react-spotify-web-playback';
import React from 'react';

class Player extends React.Component {
    
    constructor(props) {
        //Get the props from the parent component
        super(props);

        //The local state for this component
        this.state = {
            loggedIn: false, //Whether the user has given a token for this session
            token: "" //The user's token for this session
        };
    }

    //Modify the state for the user entering a token
    //Note that this doesn't actually check if the token is valid
    handleLogin() {
        if(this.state.token !== "") {
            this.setState({ loggedIn: true });
        }
    }

    render() {
        //If the user hasn't provided an API token, then display a form for them to add it
        if(this.state.loggedIn){ 
            return (
                <div style={{width: '800px', marginTop: '300px', marginRight: 'auto', marginLeft: 'auto'}}>
                    <SpotifyPlayer
                        token = {this.state.token}
                        uris={['spotify:artist:6HQYnRM4OzToCYPpVBInuU']}
                        name='VibeMachine'
                    />
                </div>
            );
        } else {
            return (
                <div>
                    <p className="App-intro">
                        Enter your Spotify access token. Get it from{" "}
                        <a href="https://beta.developer.spotify.com/documentation/web-playback-sdk/quick-start/#authenticating-with-spotify">
                        here
                        </a>.
                    </p>
                    <p>
                        <input type="text" value={this.state.token} onChange={e => this.setState({ token: e.target.value })} />
                    </p>
                    <p>
                        <button onClick={() => this.handleLogin()}>Go</button>
                    </p>
                </div>
            );
        }
    }
}

export default Player;
