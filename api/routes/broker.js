

async function run(app, db, query_promise, mc, topic, messageBuffer){

    try {

        topic = topic.toString()
        let topicArgs = topic.split("/"); // On divise le string en tableau par "/"
        let device = whosentme(topicArgs) // Qui envoie à moi



        if(device === "carabine"){
            let idCarabine = Number(topicArgs[0].split(":")[1]); // L'id de la carabine
            if(topicArgs[1] === "PC_carabine")return; // Si c'est moi qui a envoyé à la carabine : on bloque
            
            let message = messageBuffer.toString();

            let data = await query_promise(`SELECT * FROM stand WHERE id=${idCarabine} `);
            let munitions = Number(data[0].munitions);
            let doitRecharger = Boolean(data[0].doitRecharger);
            let topicEnvoyer = topicArgs[0]+"/PC_carabine"

            if(message === "tir?"){ // appuie sur la gachette
                
                if(doitRecharger === true)return envoyer(topicEnvoyer, "non");
                if(munitions === 0)return envoyer(topicEnvoyer, "non");
                munitions--;

                // Moins 1 munition dans la db  
                db.query(`UPDATE stand
                SET munitions = ${munitions},
                doitRecharger = ${true}
                WHERE id = ${idCarabine}`)

                return envoyer(topicEnvoyer, "oui")
            } 
            if(message === "recharge" && doitRecharger){ // rechargeement
                db.query(`UPDATE stand
                SET doitRecharger = ${false}
                WHERE id = ${idCarabine}`)
            }
        }


        if(device === "cible"){ // dev 
            let message = messageBuffer.toString();
            
            let idStand = Number(message.split(":")[0]); // L'id du stand des cibles
            let etatscibles = message.split(":")[1].split(","); // L'id de la cible

            if(topicArgs[1] === "PC_carabine")return; // Si c'est moi qui a envoyé à la carabine : on bloque



            let standrow = await query_promise(`SELECT * FROM stand WHERE id=${idStand} `);
            let standdatacibles = await query_promise(`SELECT * FROM datacibles WHERE fk_standid=${idStand} `);

            let etatstart = Boolean(standrow[0].started)

            etatscibles.forEach((etatCible, index) => {
                    // index = idCible+1

            if(etatstart && standrow[0]["cible"+(index+1)] !== Number(etatCible)){ 
                    db.query(`UPDATE stand
                    SET cible${index+1} = ${etatCible}
                    WHERE id = ${idStand}`)

                    let tempstouche = getTempsTouche();
                    console.log(tempstouche)
                    tempstouche = tempstouche / 1000



                    db.query(`UPDATE datacibles
                    SET cible${index+1}time = ?
                    WHERE fk_standid = ?`, [tempstouche, idStand])
                }


        });

        
                function getTempsTouche(){
                    let startedtime = standdatacibles[0]?.startedtime
                    if(startedtime) startedtime = new Date(startedtime).getTime();

                    let temps = new Date().getTime()


                    if(startedtime){
                        return temps - startedtime;
                    }

                    else return false;
                    
                }

            
        }



        function whosentme(topicArgs){ //Savoir qui a envoyé le message
            if(topicArgs[0].startsWith("carabine")){
                return "carabine";
            }
            if(topicArgs[0].startsWith("cible")){
                return "cible";
            }
        }
        
        
        function envoyer(topic, message){
            mc.publish(topic, message, options = {})
            .then(_ => {
                //console.log('Publish works!')
            })
        }


    } catch (error) {
        console.error(error);
    }
  
}   
 



module.exports = {
    run
}