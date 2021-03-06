import preprocessTrack from './analysis/preProcess';
import { config } from './analysis/jukeboxConfig';
import { calculateEdges } from "./analysis/edgeFind";
import { Driver } from "./analysis/driver";
import React from 'react';

class VibeMachine extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            token: "",
            deviceId: "",
            error: "",
            trackName: "Track Name",
            artistName: "Artist Name",
            albumName: "Album Name",
            playing: false,
            position: 0,
            duration: 1,
        };

        this.driver = null;
    }

    componentDidMount() {
        this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
    }

    //Get the spotify audio analysis data from the endpoint
    //Input: The Spotify ID of the desired song
    //Input: Callback
    getAudioAnalysis(id, callback) {
        var endpointUrl = "https://api.spotify.com/v1/audio-analysis/" + id;
       
        //Make the request asynchronously and handle the result
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                callback(JSON.parse(xmlHttp.responseText));
            }

        };

        xmlHttp.open("GET", endpointUrl, true);
        xmlHttp.setRequestHeader('Authorization', 'Bearer ' + this.props.token);
        xmlHttp.send(null);
    }

    onPrevClick() {
        this.player.previousTrack();
    }

    onPlayClick() {
        this.player.togglePlay();
    }

    onNextClick() {
        this.player.nextTrack();
    }

    checkForPlayer() {
        const { token } = this.state;

        // if the Spotify SDK has loaded
        if (window.Spotify !== null) {
            // cancel the interval
            clearInterval(this.playerCheckInterval);
            // create a new player
            this.player = new window.Spotify.Player({
                name: "Vibe Machine",
                getOAuthToken: cb => { cb(this.props.token); },
            });
            // set up the player's event handlers
            this.createEventHandlers();

            // finally, connect!
            this.player.connect();

            /*this.getAudioAnalysis("4NtUY5IGzHCaqfZemmAu56", (track) => {
                let preProcess = preprocessTrack(track);
                let jukeboxData = Object.assign({}, config);
                calculateEdges(jukeboxData, preProcess);
                console.log(track);
                let driver = new Driver(track, this.skipToPosition, jukeboxData);
                this.driver = driver
            });*/
        }
    }

    createEventHandlers() {
        // problem setting up the player
        this.player.on('initialization_error', e => { console.error(e); });
        // problem authenticating the user.
        // either the token was invalid in the first place,
        // or it expired (it lasts one hour)
        this.player.on('authentication_error', e => {
            console.error(e);
            this.setState({ loggedIn: false });
        });
        // currently only premium accounts can use the API
        this.player.on('account_error', e => { console.error(e); });
        // loading/playing the track failed for some reason
        this.player.on('playback_error', e => { console.error(e); });

        // Playback status updates
        this.player.on('player_state_changed', state => this.onStateChanged(state));

        // Ready
        this.player.on('ready', async data => {
            let { device_id } = data;
            console.log("Let the music play on!");
            // set the deviceId variable, then let's try
            // to swap music playback to *our* player!
            await this.setState({ deviceId: device_id });
            this.transferPlaybackHere();
        });
    }

    onStateChanged(state) {
        // only update if we got a real state
        if (state !== null) {
            console.log('update')
            const {
                current_track: currentTrack,
                position,
                duration,
            } = state.track_window;
            const trackName = currentTrack.name;
            const albumName = currentTrack.album.name;
            const artistName = currentTrack.artists
                .map(artist => artist.name)
                .join(", ");

            if (trackName !== this.state.trackName) {
                console.log(trackName)
                console.log(state.track_window)
                if (this.driver) clearInterval(this.driver.timer);
                this.getAudioAnalysis(state.track_window.current_track.id, (track) => {
                    let preProcess = preprocessTrack(track);
                    let jukeboxData = Object.assign({}, config);
                    calculateEdges(jukeboxData, preProcess);
                    console.log(track);
                    let driver = new Driver(track, this.skipToPosition, jukeboxData);
                    this.driver = driver
                });
            }
            const playing = !state.paused;
            this.setState({
                position,
                duration,
                trackName,
                albumName,
                artistName,
                playing
            });
        } else {
            // state was null, user might have swapped to another device
            this.setState({ error: "Looks like you might have swapped to another device?" });
        }
    }

    transferPlaybackHere() {
        const { deviceId } = this.state;
        // https://beta.developer.spotify.com/documentation/web-api/reference/player/transfer-a-users-playback/
        fetch("https://api.spotify.com/v1/me/player", {
            method: "PUT",
            headers: {
                authorization: `Bearer ${this.props.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "device_ids": [ deviceId ],
                // true: start playing music if it was paused on the other device
                // false: paused if paused on other device, start playing music otherwise
                "play": true,
            }),
        }).then(() => {

        });
    }

    skipToPosition = (position) => {
        console.log(this)
        this.player.seek(position).then(() => {
            console.log('Skipped')
        })
    }

    render() {

        const {
            token,
            loggedIn,
            trackName,
            artistName,
            albumName,
            error,
            playing
        } = this.state;

        return (
            <div>
                <p>Artist: {artistName}</p>
                <p>Track: {trackName}</p>
                <p>Album: {albumName}</p>
                <p>
                    <button onClick={() => this.onPrevClick()}>Previous</button>
                    <button onClick={() => this.onPlayClick()}>{playing ? "Pause" : "Play"}</button>
                    <button onClick={() => this.onNextClick()}>Next</button>
                </p>
            </div>
        )
    }

}

export default VibeMachine;
