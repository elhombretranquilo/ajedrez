// Based on Lets create a Chess game with React || Chess.js || react-chessboard by CodeWithDarkwa.
// https://www.youtube.com/watch?v=dbDTiTIphCY
// By Miguel ángel Ochando Casasempere

import './App.css';
import {useState, useEffect} from 'react';
import {Chessboard} from 'react-chessboard'
import {Chess} from 'chess.js'

//import $ from 'jquery';
//mport ReactDOM from 'react-dom';

//import {Stockfish} from './stockfish-nnue-16';


function App() {
  const [game, setGame]=useState(new Chess());

  // Function form random computer movement
  
  function makeRandomMove(){
    //const copyGame = new Chess(game.fen());
    const possibleMove=game.moves();
    //var move=null;
    if (game.isGameOver()||game.isDraw()||possibleMove.length===0) return;
    const randomIndex=Math.floor(Math.random()*possibleMove.length);
    const move= game.move(possibleMove[randomIndex]);
    if (move){
      setGame(new Chess(game.fen()));
    }
  }
  
 /*
  function makeEngineMove(){
    var lozza = new Worker('lozza.js');
    
    lozza.onmessage = function (e) {
      //$('#dump').append(e.data);             //assuming jquery and a div called #dump
                                             //parse messages from here as required
      console.log(e.data);
    };
    
    lozza.postMessage('uci');                // lozza uses the uci communication protocol
    lozza.postMessage('ucinewgame');         // reset tt
    lozza.postMessage('position startpos');
    lozza.postMessage('go depth 10');        // 10 ply search
    
  }
  */
 /*
  function makeEngineMove(){
    var stockfish = new Worker('stockfish-nnue-16.js');
    
    stockfish.onmessage = function (e) {
                                                 //parse messages from here as required
      console.log(e.data);
    };
    
    stockfish.postMessage('uci');                
    stockfish.postMessage('ucinewgame');         
    stockfish.postMessage('position startpos');
    stockfish.postMessage('go depth 10');        // 10 ply search
    
  }
  */

  function onDrop(source, target){
  //var copyGame = new Chess(game.fen());
  const move = game.move({
    from: source, 
    to: target, 
    promotion: "q"
  });
  
  if (move){
    setGame(new Chess(game.fen()));
  }
  setTimeout(makeRandomMove,200);
  //setTimeout(makeEngineMove,200);
  return true;
}

  return (
    <div className='app'>
      <Chessboard
        id="ChessboardWithProps"
        position={game.fen()}
        boardWidth={400}
        boardHeight={400}
        onPieceDrop={onDrop}
      
      />
    </div>
 
  );
}

export default App;