import React from 'react';
import axios from 'axios';

import  { withRouter } from "react-router"

import config from "../../config.json"

import "./StandID.css"

import touchelogo from "./touche.png"
import nontouchelogo from "./nontouche.png"

class StandID extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
            joueur: "Guest",
            munitions: 5,
            cible1: false,
            cible2: false,
            cible3: false,
            cible4: false,
            cible5: false,
            boutonEtat: "",
            cible1time: undefined,
            cible2time: undefined,
            cible3time: undefined,
            cible4time: undefined,
            cible5time: undefined,
          }
          this.handleClick = this.handleClick.bind(this);
      }


      

       handleClick(event) {              // event lorsque bouton cliqué
        const currentUrl = window.location.href
        const boutonid = event.target.getAttribute('id')
        

        axios.get(config.apiurl+'setStand', {
            params: {
            stand: this.props.match.params.standid,
            cmd: boutonid
            }
        })
        .then((response) =>{
            // handle success
                this.setState({boutonEtat: response.data});
            })
    }


    getStand = async () => {
        const response = await axios.get(config.apiurl+'getStandData', {
            params: {
            stand: this.props.match.params.standid
            }
      })

      let munitions = response.data.standdata.munitions;
      let player = response.data.player;
      let cibles = response.data.standdata;
      let ciblestime = response.data.ciblestime

      this.setState({munitions: munitions, joueur: player});
   
      for (let i = 1; i <= 5; i++) {
        
        
        this.setState({["cible"+i]: Boolean(cibles["cible"+i])});
        this.setState({["cible"+i+"time"]: ciblestime["cible"+i+"time"]});
      }

      
      
}





componentDidMount() {
this.getStand()

setInterval(() => {
    this.getStand();
}, 1500)
}

    
    render(){
        let cibles = [];
        

        for (let i = 1; i <= 5; i++) {
      
            let etatcible = this.state["cible"+i];
         
            console.log(this.state)
       
            if(etatcible === false){ // NON TOUCHE 
                cibles.push(
                    <div id="cible" key={i}>
                         <img src={touchelogo} alt="touche"></img>
                        <p>Cible {i}</p>
                        Non touché
                    </div>
                )
              
            }else if(etatcible === true){ // touché
                cibles.push(
                    <div id="cible" key={i}>
                        <img src={nontouchelogo} alt="nontouche"></img>
                        <p>Cible {i}</p>
                        Touché en 
                            {"\n"+this.state["cible"+i+"time"]}
                    </div>
                )
              
            } else {
                cibles.push(
                 <h1>ERROR DATABASE</h1>
                )
            }
            
            
        }



        let standid = this.props.match.params.standid
    return (
            <div className= "stand">
                <h1>Stand numéro {standid}</h1>

                <div className='cibles'>
                    {cibles}
                </div>

                <br></br>
                <br></br>

                <div className='boutons'>
                    <button id="start" style={{backgroundColor: 'green', color: 'white'}} onClick={this.handleClick}>
                        Commencer
                    </button>
                    <button id="reset" style={{backgroundColor: 'blue', color: 'white'}} onClick={this.handleClick}>
                        Rénitialiser
                    </button>

                    <p>{this.state.boutonEtat}</p>
                </div>

                <div className = "munitions">
                    <h2>Munitions: {this.state.munitions}</h2>
                </div>

                <div className = "utilisateur">
                    <h2>Joueur: {this.state.joueur}</h2>
                </div>
            </div>
        )}

    }
    
    
    export default withRouter(StandID)