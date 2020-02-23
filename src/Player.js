//import SpotifyPlayer from 'react-spotify-web-playback';
import VibeMachine from './VibeMachine.js';
import React from 'react';

class Player extends React.Component {
    
    constructor(props) {
        //Get the props from the parent component
        super(props);

        this.updateStateVariables = this.updateStateVariables.bind(this);

        //The local state for this component
        this.state = {
            loggedIn: false, //Whether the user has given a token for this session
            accessToken: "", //The user's access token for this session
            refreshToken: "",
            redirectURL: "http://localhost:3000/vibe",
            clientID: "4b01d4848349477e905afb4fd80ed5c5",
            clientSecret: "a88c379a9f794868bde44f51eec1bfec",
            expiresIn: -1
        };
    }

    //This code was totally stolen. https://html-online.com/articles/get-url-parameters-javascript/
    getUrlVars() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
    }    

    //Update the state
    updateStateVariables(dictToUpdate) {
        console.log(dictToUpdate);
        this.setState(dictToUpdate);
    }

    //Get the access and refresh tokens for the player to use
    getTokens() {
        //This makes me want to cry. Don't do this if you can avoid it!
        var self = this;

        //Get the code returned from spotify
        var auth_code = this.getUrlVars()["code"]

        var endpointUrl = "https://accounts.spotify.com/api/token";


        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                var response = JSON.parse(xmlHttp.response);
                console.log(response);
                self.setState({
                    accessToken: response["access_token"], 
                    refreshToken: response["refresh_token"],
                    expiresIn: response["expires_in"],
                    loggedIn: true
                });
            }
        }

        xmlHttp.open("POST", endpointUrl, true);

        //Set the request header parameters
        xmlHttp.setRequestHeader("Authorization", "Basic " + btoa(this.state.clientID + ":" + this.state.clientSecret));
        xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        //Send the parameters in the request body
        var params= 'grant_type=authorization_code' +
                            '&code=' + auth_code + 
                            '&redirect_uri=' + encodeURIComponent(this.state.redirectURL);

        xmlHttp.send(params);
    }


    render() {
        //If the user hasn't provided an API token, then display a form for them to add it
        if(this.state.loggedIn){ 
            console.log(this.state.accessToken);
            return (
                <div style={{width: '800px', marginTop: '300px', marginRight: 'auto', marginLeft: 'auto'}}>
                    <VibeMachine
                        token = {this.state.accessToken}
                        refresh_token = {this.state.refreshToken}
                        expires_in = {this.state.expires_in}
                        uris={['spotify:artist:6HQYnRM4OzToCYPpVBInuU']}
                        name='VibeMachine'
                    />
                </div>
            );
        } else {

            //Get the client and refresh tokens
            this.getTokens()

            //Display a terribly entertaining loading message
            return (
                <h1>Getting tokens...</h1>
            );
        }
    }
}

export default Player;
