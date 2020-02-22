import SpotifyPlayer from 'react-spotify-web-playback';

class VibeMachine extends SpotifyPlayer {
    constructor(props) {
        super(props);
    }

    //Get the spotify audio analysis data from the endpoint
    //Input: The Spotify ID of the desired song
    //Input: Callback
    getAudioAnalysis(id, callback) {
        var endpointUrl = "https://api.spotify.com/v1/audio-analysis/" + id
       
        //Make the request asynchronously and handle the result
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                callback(xmlHttp.responseText);
            }

        }

        xmlHttp.open = ("GET", endpointUrl, true);
        xmlHttp.send(null);
    }


}

export default VibeMachine;
