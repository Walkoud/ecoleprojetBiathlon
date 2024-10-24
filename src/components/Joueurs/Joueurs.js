import React from 'react';
import axios from 'axios';

//import "./Joueurs.css"
import config from "../../config.json"

import "./Joueurs.css"


class Joueurs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputnom: '',
            inputprenom: '',
            statut: "",
            players: []
        };
        this.selectStand = this.selectStand.bind(this);
        this.deleteID = this.deleteID.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
      }


    handleClick(event) {              // event lorsque bouton cliqué
        const id = event.target.getAttribute('id')
        

        if(id === "inputnom"){
            this.setState({ inputnom: event.target.value });
        }
        else if (id === "inputprenom"){
            this.setState({ inputprenom: event.target.value });
        }
    }



    handleSubmit = async (event) => {
        event.preventDefault();
    
        const { inputnom, inputprenom } = this.state;
    
        // Envoyer les informations d'identification de l'utilisateur au serveur API Node.js
        try {
          const response = await axios.get(config.apiurl+'newPlayer', {
            params: {
                forname: inputnom,
                firstname: inputprenom,
            }
          })

        
            this.setState({ statut: response.data });

            if(response.data && response.data?.toLowerCase() === "success"){
                const players = await this.getPlayersTables();
        
                this.setState({ players });
            }
         
        } catch (error) {
          console.error(error);
        }
      };

      
      deleteID = async (event) => {

        const id = event.target.getAttribute('id')

        try {
            const response = await axios.get(config.apiurl+'deletePlayer', {
                params: {
                    id: id
                }
            })

            this.setState({ statut: response.data });

            this.state.players.forEach((element, index) => {
                if(Number(element.key) === Number(id)){
                     // Supprimer l'élément du tableau à l'index courant
                    this.state.players.splice(index, 1);
                    // Mettre à jour l'état du composant avec le nouveau tableau de joueurs
                    
                    this.setState({ players: this.state.players });

                }
            });
          
            
        } catch (error) {
            
        }
      }

      selectStand = async (event, id) => {
        const selectedValue = document.getElementById(`selectstands-${id}`).value;

        if(selectedValue && Number(selectedValue) ){
            
        }
        if(selectedValue === "null"){

        }
      }


      async getPlayersTables(){
        try {
            const response = await axios.get(config.apiurl+'getPlayers', {
            })
  
          
            let html = []
            let row = response.data.row;
            
            html.push(
                <tr key="header-row">
                    <th >id</th>
                    <th>Nom</th>
                    <th>Prenom</th>
                    <th>Action</th>
                </tr>
            )

            await row.forEach(element => {
                if(element.id === 1){
                    // on ne montre pas le guest
                } else {
                    html.push(
                        <tr key={element.id}>
                            <td>{element.id}</td>
                            <td>{element.nom}</td>
                            <td>{element.prenom}</td>
                            <td>
                                <button name='delete' id={`${element.id}`} onClick={this.deleteID}>
                                    Supprimer
                                </button>
                                <select name="stands" id={"selectstands-"+element.id} onChange={(event) => this.selectStand(event, element.id)}>
                                    <option value="null" selected>assigner stand</option>
                                    <option value="1">1</option>
                                    <option value="2">2 </option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </select>
                            </td>
                        </tr>
                    )   
                }

            });

          
              return html;
           
          } catch (error) {
            console.error(error);
          }
      }


      
      async componentDidMount() {
        const players = await this.getPlayersTables();
        
        this.setState({ players });
    
        console.log(players)
      }
    
    
    render(){
        
    return (
        <>
            <div className="insert">
                <form onSubmit={this.handleSubmit}>
                    <label>
                    Nom de famille:
                    <input type="text" id="inputnom" onChange={this.handleClick}  />
                    </label>
                    <br />
                    <label>
                    Prénom:   
                    <input type="text" id="inputprenom" onChange={this.handleClick} />
                    </label>
                    <br />
                    <br />
                    <button type="submit">Insérer joueur</button>
                    <br />
                    <h2>{this.state.statut}</h2>
                </form>
            </div>
            <div className="joueurs">
                <table>
                    <tbody>
                        {this.state.players}
                    </tbody>
                </table>
            </div>
        </>
        )}

    }
    
    
    export default Joueurs