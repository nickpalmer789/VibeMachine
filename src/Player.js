import SpotifyPlayer from 'react-spotify-web-playback';
import React from 'react';

function Player() {
    return (
    <div style={{width: '800px', marginTop: '300px', marginRight: 'auto', marginLeft: 'auto'}}>
        <SpotifyPlayer
            token="BQAifPEqIk2EaGTSgJNns7xdmC5df0G2Wz7-kRBX39icniiOvJr9VSbOyMHghuuBcATqv7Q8wb5rCLwa2kzJQDhOGFidQbIGx-m1bLt8AGSc8r1tv6b7o3lSkMtODsVsjmroCu2ZCbDVYg2D-SytS-S4yiTwPUlFFcND0YXjbpNzwNQVrGxHkFyyETUWsRU"
            uris={['spotify:artist:6HQYnRM4OzToCYPpVBInuU']}
            name='VibeMachine'
        />
    </div>
    );
}

export default Player;
