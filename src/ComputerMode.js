//Necesarios para comunicarse con la API de Stockfish
import React, { useState, useEffect } from 'react';
import axios from 'axios';

//Se utiliza para llamar a Stockfish en el modo análisis
//const StockfishAPI = (fen) => {
const StockfishAPI = ({fen}) => {
    //const [fen, setFen] = useState('rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1');
    
    //const [mode, setMode] = useState('wasm');
    //const [mode, setMode] = useState('bestmove');
    

    const [depth, setDepth] = useState(10);
    
    const [bestMove, setBestMove] = useState('');
    const [evaluation, setEvaluation] = useState('');
    const [jugadasMate, setJugadasMate] = useState('');
  
   //useEffect(() => {
      const fetchBestMove = async () => {
        try {
          const response = await axios.get(`https://stockfish.online/api/s/v2.php?fen=${fen}&depth=${depth}`);
          //const response = await axios.get(`http://localhost:5000/stockfish/bestmove?fen=${fen}&mode=${mode}&depth=${depth}`);
          setBestMove(response.data.bestmove);
          setEvaluation(response.data.evaluation);
          setJugadasMate(response.data.mate);
        } catch (error) {
          console.error('Error fetching best move:', error);
        }
      };
  
    
      fetchBestMove();
      //fetchEvaluation();
    //}, [fen]);
    //}, [fen, mode, depth]);

    /*
    return (
      <div>
        <h1>Stockfish API</h1>
        <p>FEN: {fen}</p>
        <p>Depth: {depth}</p>
        <p>Best Move: {bestMove}</p>
        <p>Evaluation: {evaluation}</p>
      </div>
    );
    */
    return (
      <div>
        <p>Profundidad: {depth}</p>
        <p>Mejor movimiento: {bestMove.split(' ')[1]}</p>
        <p>Evaluación: {evaluation}</p>
        <p>Jugadas mate: {jugadasMate} </p>
        <p>Mejor respuesta: {bestMove.split(' ')[3]} </p>
      </div>
    );
   
   
    
  }
  
  export default StockfishAPI;