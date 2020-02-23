import SpotifyPlayer from 'react-spotify-web-playback';
import preprocessTrack from './analysis/preProcess';
import { config } from './analysis/jukeboxConfig';
import { calculateEdges } from "./analysis/edgeFind";
import { Driver } from "./analysis/driver";

class VibeMachine extends SpotifyPlayer {
    constructor(props) {
        super(props);
        
        //TODO make the tokens refresh before they expire

        this.getAudioAnalysis("4NtUY5IGzHCaqfZemmAu56", (track) => {
            let preProcess = preprocessTrack(track);
            let jukeboxData = Object.assign({}, config);
            calculateEdges(jukeboxData, preProcess);
            console.log(track);
            let driver = new Driver(track, this.skipToPosition, jukeboxData);
        });
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

    skipToPosition(position) {
        console.log('Do it')
    }


}

export default VibeMachine;
