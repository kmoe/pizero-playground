'use strict';

var PokemonGO = require('pokemon-go-node-api');
var PythonShell = require('python-shell');

var a = new PokemonGO.Pokeio();

//Set environment variables or replace placeholder text
var location = {
  type: 'name',
  name: process.env.PGO_LOCATION,
};

var username = process.env.PGO_USERNAME;
var password = process.env.PGO_PASSWORD;
var provider = process.env.PGO_PROVIDER || 'google';

var pythonProcess;

a.init(username, password, location, provider, function(err) {
  if (err) throw err;

  console.log('1[i] Current location: ' + a.playerInfo.locationName);
  console.log('1[i] lat/long/alt: : ' + a.playerInfo.latitude + ' ' + a.playerInfo.longitude + ' ' + a.playerInfo.altitude);

  a.GetProfile(function(err, profile) {
    if (err) throw err;

    console.log('1[i] Username: ' + profile.username);
    console.log('1[i] Poke Storage: ' + profile.poke_storage);
    console.log('1[i] Item Storage: ' + profile.item_storage);

    var poke = 0;
    if (profile.currency[0].amount) {
      poke = profile.currency[0].amount;
    }

    console.log('1[i] Pokecoin: ' + poke);
    console.log('1[i] Stardust: ' + profile.currency[1].amount);

    setInterval(function(){
      a.Heartbeat(function(err,hb) {
        if(err) {
          console.log(err);
        }

        var scrollMessage = '';
        var thereArePokemon = false;

        for (var i = hb.cells.length - 1; i >= 0; i--) {
          if(hb.cells[i].NearbyPokemon[0]) {
            thereArePokemon = true;
            // console.log(a.pokemonlist[0])
            var pokemon = a.pokemonlist[parseInt(hb.cells[i].NearbyPokemon[0].PokedexNumber)-1];
            console.log('1[+] There is a ' + pokemon.name + ' at ' + hb.cells[i].NearbyPokemon[0].DistanceMeters.toString() + ' meters');
            scrollMessage = scrollMessage + pokemon.name + ' ' + hb.cells[i].NearbyPokemon[0].DistanceMeters.toString() + 'm ';
          }
        }

        if (pythonProcess) {
          pythonProcess.childProcess.kill();
        }

        if (thereArePokemon) {
          var options = {
            args: [scrollMessage],
          };

          pythonProcess = new PythonShell('scroll.py', options);
        } else {
          pythonProcess = new PythonShell('sine.py');
        }

        pythonProcess.on('message', function(message) {
          console.log(message);
        });

      });
    }, 30000);

  });
});