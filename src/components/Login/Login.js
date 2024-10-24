import React from 'react';
import axios from 'axios';

import "./Login.css"

import config from "../../config.json"


class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          username: '',
          password: '',
        };
      }

      handleSubmit = async (event) => {
        event.preventDefault();
    
        const { username, password } = this.state;
    
        // Envoyer les informations d'identification de l'utilisateur au serveur API Node.js
        try {
          const response = await axios.get(config.apiurl+'login', {
            params: {
              username: username,
              password: password,
              statut: "",
            }
          })

          if(response.data === "INVALID"){ // mot de passe invalide, ou username invalide
            this.setState({ statut: "Utilisateur ou mot de passe invalide" });
          }
          else {
            this.setState({ statut: "Connecté" });

           
          // Stocker le Bearer Token renvoyé par le serveur API Node.js dans le localStorage
          localStorage.setItem('token', response.data.bearer_token);
    
          // Rediriger l'utilisateur vers une autre page de l'application
          const currentUrl = window.location.href

          if(currentUrl.includes("login")){

          } else {
            window.location.reload();
          }
          // ...
          }
        } catch (error) {
          console.error(error);
        }
      };

      handleUsernameChange = (event) => {
        this.setState({ username: event.target.value });
      };
    
      handlePasswordChange = (event) => {
        this.setState({ password: event.target.value });
      };

      componentDidMount() {

      }

    render(){
        
        const { username, password, statut } = this.state;


      

        if(this.props.state.login === true){
            axios.get(config.apiurl+'logout')
  
        }
    return (
                <div id="login">
                    <form onSubmit={this.handleSubmit}>
                        <label>
                        Nom d'utilisateur:
                        <input type="text" value={username} onChange={this.handleUsernameChange} />
                        </label>
                        <br></br>
                        <label>
                        Mot de passe:
                        <input type="password" value={password} onChange={this.handlePasswordChange} />
                        </label>
                        <button type="submit">Se connecter</button>
                      
                        <h2>{statut}</h2>
                    </form>
                </div>
                
        )}

    }
    
    
    export default Login