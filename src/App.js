import React from 'react';
import logo from './logo.svg';
import './App.css';
import Player from './Player.js';


import {
    BrowserRouter as  Router,
    Switch, 
    Route,
    Link
} from "react-router-dom";

function App() {
    return (
        <Player />
    );
}

export default App;
