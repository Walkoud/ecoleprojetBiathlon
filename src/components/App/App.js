import React from 'react';

//import './App.css';

import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios'

import Navigation from '../Index/Navigation';
import Footer from '../Index/Footer';

import Login from "../Login/Login"
import Home from "../Index/Home"
import Stand from "../Stand/Stand"
import StandID from "../Stand/StandID"
import Joueurs from "../Joueurs/Joueurs"



import config from "../../config.json"



axios.defaults.withCredentials = true;

class App extends React.Component {
  state = {
    bearer_token: "",
    login: false
  }

  getUserData = () => {
    (async() => {
      axios
      .get(config.apiurl+"getUserData")
      .then(res=>{
        if(res.data?.bearer_token) {
          this.setState({
            bearer_token: res.data.bearer_token,
            login: true
          })
        }
        else {
          
        }
      }).catch((err)=>{
        console.log(err);
      })
     })()
  }

  handleClick = () => {
    // if user is logged in
  
    if(this.state.login){
      // show the logout button
 
    }else{
      // if user is not logged in
      //show the auth href
      window.location.href = config.redirectUrl;
    }
  }

  
componentDidMount() {
  if(!this.state?.bearer_token || this.state?.bearer_token === ""){
    this.getUserData()
  }
  else {
    //console.log("\n\n BEARER TOKEN : "+this.state?.bearer_token)
  }

}

  
  render(){
  const {bearer_token} = this.state;
  if(bearer_token === "") {
    return (
     
   
      <>
      <Navigation state = {this.state} login = {this.state.login} handleClick = {this.handleClick}/>
      <Login state = {this.state}/>
   
  
  
      <Footer />
  </>
      
    )
  }
  
  return (

    <>
   
   
    <Navigation state = {this.state} login = {this.state.login} handleClick = {this.handleClick}/>

    <BrowserRouter>
        <Switch>

        
          <Route exact path="/dashboard">
            <Home handleClick= {this.handleClick}/>
          </Route>
          <Route exact path="/">
            <Redirect to="/dashboard" />
          </Route>

          <Route exact path="/stand">
          <Stand state = {this.state}/>
          </Route>
          <Route exact path="/stand/:standid">
          <StandID state = {this.state}/>
          </Route>

          <Route exact path="/login">
          <Login state = {this.state}/>
          </Route>

          <Route exact path="/joueurs">
          <Joueurs state = {this.state}/>
          </Route>

          
          
        </Switch>
    </BrowserRouter>


    <Footer />

    </>

  )}
}

export default App;


