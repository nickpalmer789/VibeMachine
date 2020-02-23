import SpotifyPlayer from 'react-spotify-web-playback';
import preprocessTrack from './analysis/remixer';

class VibeMachine extends SpotifyPlayer {
    constructor(props) {
        super(props);
        this.getAudioAnalysis("4NtUY5IGzHCaqfZemmAu56", (data) => {
            console.log(data)
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


}

export default VibeMachine;
