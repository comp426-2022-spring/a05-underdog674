// Place your server entry point code here
const minimist = require("minimist")
const args = minimist(process.argv.slice(2))
console.log(args)

const help = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)
// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}
const express = require('express')

const app = express()
app.use(express.static('./public'));
const db = require("./src/services/database.js")
const fs = require('fs')
const morgan = require('morgan')
var md5 = require("md5")
const cors = require("cors")

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())


const port = args.port || 5000

// Store help text 



app.use((req, res, next) =>{
  let logdata = {
    remoteaddr: req.ip,
    remoteuser: req.user,
    time: Date.now(),
    method: req.method,
    url: req.url,
    protocol: req.protocol,
    httpversion: req.httpVersion,
    status: res.statusCode,
    referer: req.headers['referer'],
    useragent: req.headers['user-agent']
}
console.log(logdata);
const stmt = db.prepare('INSERT INTO accesslog (remoteaddr,remoteuser,time,method,url,protocol,httpversion,status,referer,useragent) VALUES (?,?,?,?,?,?,?,?,?,?)');
const info = stmt.run(logdata.remoteaddr,logdata.remoteuser, logdata.time, logdata.method,logdata.url,logdata.protocol,logdata.httpversion, logdata.satus,logdata.referer, logdata.useragent)
//console.log(info)
next()
})

const server = app.listen(port, () => {
    console.log('App is running on port %PORT%'.replace('%PORT%',port))
})


if(args.log == 'false'){}
else{
const accesLog = fs.createWriteStream('access.log', { flags: 'a' })
// Set up the access logging middleware
app.use(morgan('combined', { stream: accesLog }))
}


if(args.debug){
  app.get('/app/log/access',(req,res, next) => {
    const stmt = db.prepare('SELECT * FROM accesslog').all()
    
    res.status(200).json(stmt)
  })
    app.get('/app/error',(req,res, next) =>{
      
      throw new Error('Error Test Succesful');
    })

}




app.get('/app/',(req,res, next) => {
   
    res.json({"message":"your API works! (200)"});
    res.status(200) //.end("200 OK")
})
// BELOW THIS POINT THE USER FUNCTIONS ARENT NEEDED
app.post("/app/new/user",(req,res,next) => {
    let data = {
      user: req.body.username,
      pass: req.body.password
    }
    const stmt = db.prepare('INSERT INTO userinfo (username, password) VALUES (?,?)')
    const info = stmt.run(data.user, data.pass)
    res.status(200).json(info)
})



app.get("/app/users", (req, res) => {	
  try {
      const stmt = db.prepare('SELECT * FROM userinfo').all()
      res.status(200).json(stmt)
  } catch {
      console.error(e)
  }
});

// READ a single user (HTTP method GET) at endpoint /app/user/:id
app.get("/app/user/:id", (req, res) => {
  try {
      const stmt = db.prepare('SELECT * FROM userinfo WHERE id = ?').get(req.params.id);
      res.status(200).json(stmt)
  } catch (e) {
      console.error(e)
  }

});

// UPDATE a single user (HTTP method PATCH) at endpoint /app/update/user/:id
app.patch("/app/update/user/:id", (req, res) => {
  let data = {
      user: req.body.username,
      pass: req.body.password
  }
  const stmt = db.prepare('UPDATE userinfo SET username = COALESCE(?,username), password = COALESCE(?,password) WHERE id = ?')
  const info = stmt.run(data.user, data.pass, req.params.id)
  res.status(200).json(info)
});

// DELETE a single user (HTTP method DELETE) at endpoint /app/delete/user/:id
app.delete("/app/delete/user/:id", (req, res) => {
  const stmt = db.prepare('DELETE FROM userinfo WHERE id = ?')
  const info = stmt.run(req.params.id)
  res.status(200).json(info)
});
// Default response for any other request








app.get('/app/flips/:number/',(req,res) =>{
  res.setHeader("showing", "alex")
    res.status(200).json({'raw': coinFlips(req.params.number), 'summary': countFlips(coinFlips(req.params.number))})
    res.type("text/plain")
})

//query
//app.get('/app/echo/',(req,res)=> {
 // res.setHeader("showing", "alex")
//res.status(200).json({'message': req.query.number})

//})


//app.get('/app/echo/',logging,(req,res)=> {
  //  res.status(200).json({'message': req.body.number})
    
  //  })

  function coinFlip() {
        return (Math.floor(Math.random()*2) == 0) ? 'heads' : 'tails';
     }
        

app.get('/app/flip/',(req,res) =>{
  
var flip = coinFlip()//need to create coinFlip above
res.status(200).json( {flip})

})

//lol
app.get('/app/flip/call/heads',(req,res, next) =>{
  res.setHeader("showing", "alex")
var flipHead = "heads"//need to create coinFlip above
res.status(200).json(flipACoin(flipHead))
res.type("text/plain")
})


app.get('/app/flip/call/tails',(req,res) =>{
  
var flipTails = "tails"//need to create coinFlip above
res.status(200).json(flipACoin(flipTails))
res.type("text/plain")
})

app.use(function(req, res){
  res.json({"message":"Endpoint not found. (404)"});
    res.status(404);
  });

function countFlips(array) {
    
  var numberH= 0;
    var numberT= 0;
    if(array.length === 1 && array[0]==="heads"){
      numberH++;
      return { "heads": numberH };
    }
    if(array.length === 1 && array[0]==="tails"){
      numberT++;
      return {  "tails": numberT };
    }
    for(var i=0;i<array.length; i++){
      if(array[i]===("heads")){
        numberH++;
      }
      else if(array[i]===("tails")){
        numberT++;
      }
    }
    return { "heads": numberH, "tails": numberT };
    }


    function coinFlips(flips) {
      var coinArray = [];
      for(var x=0; x<flips; x++){
        coinArray.push(coinFlip());
      }
      return coinArray;
    }

    function flipACoin(call) {
      var theCoin = coinFlip();
        if(theCoin===call){
        return {"call": call, flip: theCoin, result: "win"};
        }
        else{
          return {"call": call, flip: theCoin, result: "lose"};
        }
        
      }


    app.use(function(req,res){
      res.status(404).send('404 NOT FOUND')
    })
    
    
    process.on('SIGINT', () => {
      server.close(() => {
          console.log('Server stopped')
      })
    })