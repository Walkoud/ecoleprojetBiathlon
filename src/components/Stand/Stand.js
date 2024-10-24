import React from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

import "./Stand.css"



class Stand extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
      }
    


    handleClick(event){              // event lorsque bouton cliqué
        const currentUrl = window.location.href
        const goUurl = currentUrl +"/" +event.target.getAttribute('id')
        //console.log(`Le bouton avec l'ID "${event.target.getAttribute('id')}" a été cliqué.`);
        return window.location.assign(goUurl)
    }


    render(){
        let stands = []

        for (let i = 1; i <= 5; i++) { // création des boutons
            stands.push(
            <div key={i}>
               <p>{"Stand "+i}</p> 
               <button id={i} onClick={this.handleClick}>
               Accéder
                </button>
            </div>
            );
            
        }
        
    return (              // la page

        <div id='stands'>
            {stands}
        </div>
   

        )}

    }
    
    
    export default Stand