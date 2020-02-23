import React from 'react';
import Cookies from 'js-cookie';
import {Redirect} from 'react-router';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';

const styles = theme => ({
            icon: {
                marginRight: theme.spacing(2),
            },
            heroContent: {
                backgroundColor: theme.palette.background.paper,
                padding: theme.spacing(8, 0, 6),
            },
            heroButtons: {
                marginTop: theme.spacing(4),
            },
            cardGrid: {
                paddingTop: theme.spacing(8),
                paddingBottom: theme.spacing(8),
            },
            card: {
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            },
            cardMedia: {
                paddingTop: '56.25%', // 16:9
            },
            cardContent: {
                flexGrow: 1,
            },
            footer: {
                backgroundColor: theme.palette.background.paper,
                padding: theme.spacing(6),
            },
            })


class Login extends React.Component {
    constructor(props) {
        //Get the props from the parent component
        super(props);
    
        //The local state for this component
        this.state = {
            token: "", //The user's token for this session
            clientID: "4b01d4848349477e905afb4fd80ed5c5",
            redirectURL: "http://localhost:3000/vibe"
        };

        
    }

    componentDidMount() {
        this.checkCookie("cookievibe");
    }

    checkCookie(cookieName) {
        var cookieValue = Cookies.get(cookieName);
        console.log(cookieValue);
        if(cookieValue != null && cookieValue != "undefined") {
            //TODO FIX THIS BULLSHIT
            window.location.replace("http://localhost:3000/vibe");
        } 
    }

    handleLogin() {
        var scopes = "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state";
        window.location.replace('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + this.state.clientID +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(this.state.redirectURL));
    }

    render() {
        const {classes} = this.props;
        

        return (
            <React.Fragment>
              <CssBaseline />
              <AppBar position="relative">
                <Toolbar>
                  <Typography variant="h6" color="inherit" noWrap>
                    Album layout
                  </Typography>
                </Toolbar>
              </AppBar>
              <main>
                {/* Hero unit */}
                <div className={classes.heroContent}>
                  <Container maxWidth="sm">
                    <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
                      Album layout
                    </Typography>
                    <Typography variant="h5" align="center" color="textSecondary" paragraph>
                      Something short and leading about the collection below—its contents, the creator, etc.
                      Make it short and sweet, but not too short so folks don&apos;t simply skip over it
                      entirely.
                    </Typography>
                    <div className={classes.heroButtons}>
                      <Grid container spacing={2} justify="center">
                        <Grid item>
                          <Button variant="contained" color="primary" onClick={() => this.handleLogin()}>
                            Main call to action
                          </Button>
                        </Grid>
                        <Grid item>
                          <Button variant="outlined" color="primary">
                            Secondary action
                          </Button>
                        </Grid>
                      </Grid>
                    </div>
                  </Container>
                </div>
              </main>
            </React.Fragment>
          );

    }
}

export default withStyles(styles)(Login);
