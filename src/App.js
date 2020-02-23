import React from 'react';
import logo from './logo.svg';
import './App.css';
import Player from './Player.js';
import Login from './Login.js';


import {
    BrowserRouter as  Router,
    Switch, 
    Route,
    Link
} from "react-router-dom";

function App() {
    return (
        <Router>
            <Switch>
                <Route exact path="/">
                    <Login />
                </Route>
                <Route path="/vibe">
                    <Player />
                </Route>
            </Switch>
        </Router>
    );
}

export default App;
