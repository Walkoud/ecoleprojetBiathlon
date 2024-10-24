
import React from 'react';


import "./Navigation.css"












class Navigation extends React.Component {
    state = this.props.state;
    

    
componentDidMount() {
  
}
  render(){

   let loginstatut;

   if(this.props.login === true){
    loginstatut = <a href="/Login">Se déconnecter</a>
   } else {
    loginstatut = <a href="/Login">Se connecter</a>
   }
 

  return (
      <>
            
            <div className="topnav">
            <a className="active" href="/dashboard">Home</a>
            <a href="/Joueurs">Joueurs</a>
            <a href="/Stand">Stand</a>
            {loginstatut}
            </div>    
      </>

     

  )}
}



export default Navigation