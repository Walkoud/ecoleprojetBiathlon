// Import des modules nécessaires
const express = require('express'); // Framework Node.js pour créer un serveur HTTP
const cors = require('cors') // Middleware pour activer CORS
const app = express(); // Création de l'application Express
const session = require('express-session'); // Middleware pour utiliser des sessions

const jwt = require('jsonwebtoken'); // Bibliothèque pour créer des JSON Web Tokens


const config = require('./config.json') // Import du fichier de configuration
let proxyUrl = config.proxyUrl // Récupération de l'URL du proxy

// Connexion à la base de données MySQL
const mysql = require('mysql');

const db = mysql.createConnection({
    host: "raspberrypi4",
    user: "admin",
    password: "1234Admin",
    database: "projet",
    charset: "utf8mb4",
    dateStrings: "true"
});

// Test de la connexion à la base de données
db.connect(function(err) {
    if (err) throw err;
    console.log("Connecté à la base de données MySQL!");
});

// Fonction pour effectuer une requête SQL asynchrone
function query_promise(q_string, q_var) {
    return new Promise((resolve, reject) => {
        db.query(q_string, q_var, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

// Initialisation du client MQTT
const MqttClient = require('mqtt-js-client');
let mc = new MqttClient('mqtt://raspberrypi4', {
    username: 'admin',
    password: '1234Admin&',
});

// Configuration de la session
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 86400000 // Durée de vie du cookie en millisecondes
    }
}));

// Configuration de CORS
app.use(cors({
    credentials: true,
    origin: "http://localhost:3000",
}));

// Lancement du serveur
app.listen(config.port, (err) => console.log('API is running on http://' + config.host + ':' + config.port + '/login'))

// Middleware pour configurer les en-têtes CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Remplacez l'URL par l'URL de votre application React, * pour tout les url
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true'); // Autorise les demandes avec les cookies
    next();
});

// Abonnement à tous les sujets MQTT
mc.subscribe('#', [], function(topic, messageBuffer, packet) {
        console.log(messageBuffer.toString()); //Prints message as utf8

        require('./routes/broker').run(app, db, query_promise, mc, topic, messageBuffer);

    })
    .then(granted => {
        console.log('Subscrition granted:', granted)
    })

// Route pour gérer la connexion à l'application
app.get("/login", async (req, res) => {
    let username = req.query.username
    let password = req.query.password

    if (username !== config.username || password !== config.password) return res.send("INVALID");

    const token = jwt.sign({}, 'secretkeycp8k1PvyNjXglZYKvTKN', {
        expiresIn: '1h'
    });
    res.setHeader('Authorization', `Bearer ${token}`);

    req.session.bearer_token = token;
    req.session.save();

    res.json({
        bearer_token: token,
        login: true,
        username: "admin",
    })

})

app.get("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) return console.log(err)
        })
        res.redirect(proxyUrl)
    } else res.redirect(proxyUrl)
})



app.get("/getUserData", async (req, res) => {

    if (!req.session?.bearer_token) {
        //res.redirect("/")
        res.json({
            login: false,
        })
    } else {
        res.json({
            bearer_token: req.session.bearer_token,
        })
    }
})


app.get("/getCibleData", async (req, res) => {

    if (!req.session?.bearer_token) {
        //res.redirect("/")
        res.json({
            login: false,
        })
    } else {

        let numerostand = req.query.stand
        let numerocible = req.query.cible

        let etat = await query_promise(`SELECT cible${numerocible} FROM stand WHERE id=${numerostand} `)

        if (etat[0][`cible${numerocible}`] === 0) {
            etat = false
        } else {
            etat = true;
        }

        res.json({
            stand: numerostand,
            cible: numerocible,
            etat: etat,
            bearer_token: req.session.bearer_token,
        })
    }
})

app.get("/getStandData", async (req, res) => {

    if (!req.session?.bearer_token) {
        //res.redirect("/")
        res.json({
            login: false,
        })
    } else {

        let numerostand = req.query.stand
        if (!numerostand) return res.send('Error: Please provide a stand number');

        let standdata = await query_promise(`SELECT * FROM stand WHERE id=${numerostand} `)
        let ciblestime = await query_promise(`SELECT * FROM datacibles WHERE fk_standid=${numerostand} `)

        if (standdata[0]) {
            let datauser = await query_promise(`SELECT * FROM users WHERE id= ${standdata[0].fk_userid}`)


            let player;

            if (!datauser[0]) {
                player = "ERROR Player";
            } else {
                player = datauser[0].nom + " " + datauser[0].prenom
            }



           
            res.json({
                stand: numerostand,
                standdata: standdata[0],
                ciblestime: ciblestime[0],
                player: player,
                bearer_token: req.session.bearer_token,
            })
        } else {
            res.send('ERROR');
        }


    }
})

app.get("/setStand", async (req, res) => {
    if (!req.session?.bearer_token) {
        //res.redirect("/")
        res.json({
            login: false,
        })
    } else {

        let numerostand = req.query.stand
        let cmd = req.query.cmd // START, RESET



        if (!numerostand) return res.send('Error: Please provide a stand number');
        if (!cmd) return res.send('Error: Please provide a command');
        if(cmd !== "start" && cmd !== "reset")return res.send('Error: Please provide correct command');
        

        let data = await query_promise(`SELECT * FROM stand WHERE id=${numerostand} `)

        if (data && data[0]) {
          data = data[0]

          if(cmd === "start"){

            if(!data.started){
                db.query(`UPDATE stand
                SET started = ${true}
                WHERE id = ${Number(numerostand)}`)

                db.query(`UPDATE datacibles
                SET startedtime = ?
                WHERE fk_standid = ?`,  [new Date(), Number(numerostand)])

                return res.send('Lancé')
            } else return res.send('Déjà lancé')


          } else if (cmd === "reset"){
            db.query(`UPDATE stand
            SET doitRecharger = ${false},
            munitions = 5,
            cible1 = ${false},
            cible2 = ${false},
            cible3 = ${false},
            cible4 = ${false},
            cible5 = ${false},
            started = ${false}
            
            WHERE id = ${Number(numerostand)}`)
            db.query(`UPDATE datacibles
            SET 
            cible1time = ${null},
            cible2time = ${null},
            cible3time = ${null},
            cible4time = ${null},
            cible5time = ${null},
            startedtime = ${null}
            WHERE fk_standid = ${Number(numerostand)}`)
            res.send('Rénitialisé')
          }
        } else {
            res.send('ERROR');
        }


    }
})



app.get("/newPlayer", async (req, res) => {
    if (!req.session?.bearer_token) {
        //res.redirect("/")
        res.json({
            login: false,
        })
    } else {
        try {
            let forname = req.query.forname
            let firstname = req.query.firstname 

            if(!forname || !firstname)return res.send('Error: please define forname and firstname')
            
            let row = await query_promise(`SELECT * FROM users WHERE nom=? AND prenom=? `, [forname, firstname])

            if(row && row[0])return res.send("Error: There is already a user with this name")

            await query_promise(`INSERT INTO users (nom, prenom) VALUES (?,?)`, [forname, firstname])

            res.send("Success")
    
        } catch (error) {
            res.send("Error sys: "+error)
        }
    }
})


app.get("/getPlayers", async (req, res) => {
    if (!req.session?.bearer_token) {
        //res.redirect("/")
        res.json({
            login: false,
        })
    } else {
        try {
            let row = await query_promise(`SELECT * FROM users`)

            res.json({
                row: row
            })
        } catch (error) {
            res.send("Error sys: "+error)
        }
    }
})


app.get("/deletePlayer", async (req, res) => {
    if (!req.session?.bearer_token) {
        //res.redirect("/")
        res.json({
            login: false,
        })
    } else {
        try {
            let idplayer = req.query.id
            if(!idplayer)return res.send('Please provide a player ID');
            let row = await query_promise(`SELECT id FROM users WHERE id = ?`, [idplayer])
            if(!row || !row[0])return res.send('This player ID doesnt exist');
            db.query(`DELETE FROM users
            WHERE id = ?`, [idplayer])
            res.send("Success")
        } catch (error) {
            res.send("Error sys: "+error)
        }
    }
})


app.get("/setPlayerStand", async (req, res) => {
    if (!req.session?.bearer_token) {
        //res.redirect("/")
        res.json({
            login: false,
        })
    } else {
        try {
            let idplayer = req.query.playerid
            let idstand = req.query.standid

            
            let rowplayer = await query_promise(`SELECT id FROM users WHERE id = ?`, [idplayer])

            if(!rowplayer || !rowplayer[0])return res.send('Invalid player : the player does not exist')

            db.query(`UPDATE stand
            SET fk_userid = ?
            WHERE fk_userid = ?`, [1, idplayer])
            
            db.query(`UPDATE stand
            SET fk_userid = ?
            WHERE id = ?`, [idplayer, idstand])

            


           
        } catch (error) {
            res.send("Error sys: "+error)
        }
    }
})








