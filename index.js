console.log("starting up!!");

const express = require('express');
const methodOverride = require('method-override');
const pg = require('pg');

// Initialise postgres client
const configs = {
  user: 'tanweekiat',
  host: '127.0.0.1',
  database: 'tunr_db',
  port: 5432,
};

const pool = new pg.Pool(configs);

pool.on('error', function (err) {
  console.log('idle client error', err.message, err.stack);
});

/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

// Init express app
const app = express();


app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(methodOverride('_method'));


// Set react-views to be the default view engine
const reactEngine = require('express-react-views').createEngine();
app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', reactEngine);

/**
 * ===================================
 * Routes
 * ===================================
 */

// app.get('/', (request, response) => {
//   // query database for all pokemon

//   // respond with HTML page displaying all pokemon
//   response.render('home');
// });

app.get('/artists/new', (request, response) => {
  // respond with HTML page with form to create new pokemon
  response.render('new');
});


app.get('/artists/', (request, response) => {
  // query database for all pokemon
const queryString = 'SELECT * from artists';

pool.query(queryString, (err, result) => {

    // let data = {
    //     artists: result.rows
    // }
    // response.render('showall', data );

    response.send(result.rows)
  })
});

//*******************************************************************************************************************

app.post('/artists',(request,response) =>{
    console.log(request.body);
    const artistArray = [request.body.name,request.body.photo_url,request.body.nationality];
    const queryString = 'INSERT INTO artists(name,photo_url,nationality) VALUES ($1,$2,$3) RETURNING *';
    console.log(queryString);

    pool.query(queryString,artistArray, (err,result) =>{
        if (err) {
            console.log('query error:',err.stack);
            response.send('query error');
        } else {
            console.log('query result: result');
            response.send(result.rows);
        }
    })
})

//*******************************************************************************************************************

app.get('/artists/:id',(request,response)=>{


        let id = parseInt(request.params.id) ;

        const queryString = "SELECT * from artists WHERE id="+id;

        pool.query(queryString, (err, result) => {

        if(err){
            console.log(err);
        }
        else {
            response.send(result.rows);
            // for ( i = 0; i < obj.artists.length; i++){
            //     if(artist === id ){
            //         return artist;
            //     }
            // }if(artist === undefined){
            //     response.status(404);
            //     response.send("Artist not found");
            // }
            // else{
            //     let data = {
            //         id:id,
            //         artist:artist,
            //         photo_url:artist.photo_url,
            //         nationality: artist.nationality                }
            //     response.render('id',data);
            }
        })
    })
//***********************************************************************************************************


 app.get('/artists/:id/edit',(request, response)=> {

        let id = parseInt(request.params.id);
        let inputV = [id];
        let queryString = "SELECT * FROM artists WHERE id = ($1)";

        pool.query(queryString, inputV, (err, result) => {

        response.render("editArtistsContent", result.rows[0])
    });
});



/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
const server = app.listen(3000, () => console.log('~~~ Tuning in to the waves of port 3000 ~~~'));

let onClose = function(){

  console.log("closing");

  server.close(() => {

    console.log('Process terminated');

    pool.end( () => console.log('Shut down db connection pool'));
  })
};

process.on('SIGTERM', onClose);
process.on('SIGINT', onClose);