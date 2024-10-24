mc.subscribe('#', [], function(topic, messageBuffer, packet) {
    console.log(messageBuffer.toString()); //Prints message as utf8
    require('./routes/broker').run(app, db, query_promise, mc, topic, messageBuffer);
})
.then(granted => {
    console.log('Subscrition granted:', granted)
})