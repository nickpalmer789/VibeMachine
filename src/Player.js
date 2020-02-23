//import SpotifyPlayer from 'react-spotify-web-playback';
import VibeMachine from './VibeMachine.js';
import React from 'react';
import Cookies from 'js-cookie';

class Player extends React.Component {
    
    constructor(props) {
        //Get the props from the parent component
        super(props);

        //The local state for this component
        this.state = {
            loggedIn: false, //Whether the user has given a token for this session
            accessToken: "", //The user's access token for this session
            refreshToken: "",
            redirectURL: "http://localhost:3000/vibe",
            clientID: "4b01d4848349477e905afb4fd80ed5c5",
            clientSecret: "a88c379a9f794868bde44f51eec1bfec"
        };


    }

    componentDidMount() {
        this.checkCookie("cookievibe");
    }

    //Check for a cookie with the access tokens in it already
    checkCookie(cookieName) {
        var self = this;
        var cookieValue = Cookies.get(cookieName);

        if(cookieValue != null && cookieValue !== "undefined") {
            var cookieArray = cookieValue.split("|");
            if (Date.now() - parseFloat(cookieArray[2]) > 1000 * 60 * 30) {
                this.getTokens()
            } else {
                self.setState({
                    accessToken: cookieArray[0],
                    refreshToken: cookieArray[1],
                    lastRefresh: cookieArray[2],
                    loggedIn: true
                });
            }

        }
    }

    //Set the cookie with the access tokens in it already
    setAccessCookie(cookieName, accessToken, refreshToken, lastRefresh) {
        //Remove the old cookie if one exists
        Cookies.remove(cookieName);


        setTimeout(() => {
            this.refresh(refreshToken)
        }, 1000 * 60 * 30);

        //This name is terrible, but I found it funny. Hackathons are fun.
        let dough = accessToken + "|" + refreshToken + '|' + lastRefresh;

        Cookies.set(cookieName, dough);

        Cookies.set(cookieName + "Date", (new Date).getTime());
    }


    //This code was totally stolen. https://html-online.com/articles/get-url-parameters-javascript/
    getUrlVars() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
    }

    refresh(refreshToken) {
        let endpointUrl = 'https://accounts.spotify/api/token';
        let self = this;

        let xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                let response = JSON.parse(xmlhttp.response);
                self.setState({accessToken: response['access_token']})
            }
        };

        xmlhttp.open("POST", endpointUrl, true);

        xmlhttp.setRequestHeader("Authorization", "Basic " + btoa(this.state.clientID + ":" + this.state.clientSecret));
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        let params = 'grant_type=refresh_token&refresh_token=' + self.state.refreshToken;

        xmlhttp.send(params);
    }

    //Get the access and refresh tokens for the player to use
    getTokens() {
        //This makes me want to cry. Don't do this if you can avoid it!
        let self = this;

        //Get the code returned from spotify
        let auth_code = this.getUrlVars()["code"];

        let endpointUrl = "https://accounts.spotify.com/api/token";


        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                let response = JSON.parse(xmlHttp.response);
                console.log(response);

                self.setAccessCookie("cookievibe", response["access_token"], response["refresh_token"]);

                self.setState({
                    accessToken: response["access_token"], 
                    refreshToken: response["refresh_token"],
                    loggedIn: true
                });
            }
        };

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
                        uris={['spotify:track:4NtUY5IGzHCaqfZemmAu56']}
                        refresh_token = {this.state.refreshToken}
                        expires_in = {this.state.expires_in}
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
