// Based on Lets create a Chess game with React || Chess.js || react-chessboard by CodeWithDarkwa.
// https://www.youtube.com/watch?v=dbDTiTIphCY
// By Miguel Ángel Ochando Casasempere

import './App.css';
import {useState} from 'react';
import {Chessboard} from 'react-chessboard';
import {Chess} from 'chess.js';
import {Boton,ColorBox,NumberSelector,ToggleSwitch,SparePieces,ChessboardComponent} from './Components';

import StockfishAPI from './ComputerMode';
//import OpeningBookReader from './Aperturas.js';


//import $ from 'jquery';
//mport ReactDOM from 'react-dom';

//import {Stockfish} from './stockfish-nnue-16';


function App() {
  const [game, setGame]=useState(new Chess());
  const [depth, setDepth] = useState(3);
  const [oponenteMaquina,setOponenteMaquina]=useState(true);

  //Para guardar el estado del tablero antes de editarlo 
  //por si se decide cancelar la edición para poder recuperar el estado anterior
  const [fenAnterior, setFenAnterior]=useState(null);
  const [oponenteAnterior, setOponenteAnterior]=useState(null);
  const [depthAnterior, setDepthAnterior]=useState(null);
  const [orientAnterior,setOrientanterior]=useState(null);

  //Para mostrar mensajes sobre la partida en la pantalla 
  const[mensajeAbandonar,setMensajeAbandonar]=useState('');
  
  //Para mostrar u ocultar opciones de configuración
  const [showControls, setShowControls] = useState(false);
  const [showBotonesEdicion, setShowBotonesEdicion]=useState(false);
  //const [piezasEdicion, setPiezasEdicion]=useState(false);

  //Para mostrar mensaje de análisis de Stockfish
  const[showStockfish, setShowStockfish] =useState(false);

  //Para mostrar u ocultar botones de juego
  const[showBotonesJuego,setShowBotonesJuego]=useState(false);

  //Para controlar en qué estado está el juego: 'juego', 'espera', 'fin','analisis' o 'edicion'
  const [estado,setEstado]=useState('espera');

  //Para controlar el número de jugadas que se han hecho en la partida
  const [numjugada,setNumjugada]=useState(0);

  //Para abortar el fetch de datos a Stockfish
  let abortController=new AbortController();
  let solicitudActual=null;

  //Para mostrar en el tablero a quién le toca jugar
  //const [colorTurno, setColorTurno] = useState('white');

  //Opciones de configuración de los botones
  const azulClaro = 'rgb(200, 200, 255)';
  const rojoClaro = 'rgb(250, 250, 150)';
  const estiloBoton={
    width: '200px',
    height: '50px',
    color: 'blue',
    border: '1px solid blue',
    fontSize: '16px',
    borderRadius: '10px',
    backgroundColor: 'white',
  };
  const estiloBotonHover={
    width: '200px',
    height: '50px',
    color: 'blue',
    border: '1px solid blue',
    fontSize: '16px',
    borderRadius: '10px',
    backgroundColor: azulClaro,
  };

  const estiloBotonPartida={
    color: 'red',
    border: '1px solid red',
    padding: '10px 20px',
    fontSize: '14px',
    borderRadius: '10px',
    textAlign: 'center',
    width: '120px',
    backgroundColor:'white',
  };
  const estiloBotonPartidaHover={
    color: 'red',
    border: '1px solid red',
    padding: '10px 20px',
    fontSize: '14px',
    borderRadius: '10px',
    textAlign: 'center',
    width: '120px',
    backgroundColor: rojoClaro,
  };

//Indica qué piezas se ven en la parte baja de la pantalla, lo que corresponde al color del usuario
  const [orient,setOrient] = useState("white"); 
 
  //const [bestMove, setBestMove] = useState('');
  //const [evaluation, setEvaluation] = useState('');

  
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
      //actualizaMensajeJuego();
      if (game.turn()==='b'){
        setNumjugada(numjugada+1);
      }

    }
  };


  //Se encarga de pedir la mejor jugada a una API de Stockfish y esperar la respuesta
  function makeComputerMove(fen){
    //const fen = game.fen();
    const texto = '';
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();
    const signal = abortController.signal;
        

    const promesa=fetch(`https://stockfish.online/api/s/v2.php?fen=${fen}&depth=${depth}`, {
      method: 'GET', 
      signal: signal
      //headers: {
      //  'Content-Type': 'application/json'
      //}
    })
      .then(response => response.json())
      /*
      .then(data => {
        const jugada = JSON.stringify(data.bestmove);
        const pfrom =jugada.substring(10,12);
        const pto = jugada.substring(12,14);
        const ppromo = jugada.substring(14,15);
        const move = game.move({
          from: pfrom,
          to: pto,
          promotion: ppromo
        })
        abortController=null;
        if ((estado==='juego')||(estado==='pensando')){
          setGame(new Chess(game.fen()));
        }
        if (game.turn()==='b'){
          setNumjugada(numjugada+1);
        }
        if (game.isGameOver()){
          setShowBotonesJuego(false);
        }
        return move;
      })
      */
      .catch(error => console.error('Error:', error));
      return{promesa, controlador: abortController};
  };

  function iniciarAnalisisStockfish(fen) {
    //const fen = game.fen();
    const { promesa, controlador } = makeComputerMove(fen);
    solicitudActual = { promesa, controlador };
    promesa
      /*
      .then(move => {
        solicitudActual = null;
        //console.log('Mejor jugada:', move);
      })
      */
      .then(data => {
        const jugada = JSON.stringify(data.bestmove);
        const pfrom =jugada.substring(10,12);
        const pto = jugada.substring(12,14);
        const ppromo = jugada.substring(14,15);
        abortController=null;
        if (((estado==='juego')||(estado==='pensando'))&(fen===game.fen())){
          const move = game.move({
            from: pfrom,
            to: pto,
            promotion: ppromo
          })
          setGame(new Chess(game.fen()));
        }
        if (game.turn()==='b'){
          setNumjugada(numjugada+1);
        }
        if (game.isGameOver()){
          setShowBotonesJuego(false);
        }
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          console.log('La solicitud a Stockfish fue cancelada');
        } else {
          console.error('Error al obtener la jugada de Stockfish:', error);
        }
        solicitudActual = null;
      });
  }

  function cancelarPeticionStockfish(){
    //console.log(solicitudActual);
    
    if (solicitudActual) {
      solicitudActual.controlador.abort();
      solicitudActual=null;
      console.log('Solicitud a Stockfish cancelada externamente');

    }
    
  
  }


  //Gestiona los mensajes del juego
  function actualizaMensajeJuego(game){
    let mensajeJuego='';
    if (game.inCheck()){
        if (game.isGameOver()){
          if (orient==='white'){
            if (game.turn()==='w'){
              mensajeJuego='Jaque mate. Ganan negras, has perdido';
            } else {
              mensajeJuego='Jaque mate. Ganan blancas, has ganado';
            }
          } else{
            if (game.turn()==='w'){
              mensajeJuego='Jaque mate. Ganan negras, has ganado';
            } else {
              mensajeJuego='Jaque mate. Ganan blancas, has perdido';
            }
          } 
          //setEstado('fin');
          //setMensajeEstado('Juego terminado');
        } else {
          mensajeJuego='Jaque';
        }
    } else {
      if (game.isDraw()){
        mensajeJuego='Tablas';
        //setEstado('fin');
        //setMensajeEstado('Juego terminado');
      } else {
        mensajeJuego='';
      }
    }
    return(mensajeJuego);

  };

  function actualizaMensajeEstado(njugada,est,game){
    let mensaje='';
    if (game.isGameOver()){
      mensaje='Juego terminado';      
    }else{
      if (est==='juego'){
        mensaje='Jugando';
      } else if (est==='espera'){
        mensaje='Pausado';
      }else if (est==='analisis'){
        mensaje='Analizando';
      }else if (est==='edicion'){
        mensaje='Editando';
      } else if (est==='fin'){
        mensaje='Juego terminado';
      } else if (est==='pensando'){
        mensaje='Juega la máquina';
      }   
      
    }
    mensaje=mensaje + ". Jugada " +njugada;
    return (mensaje);
  };

  const handlePromotion =(piece) => {
    let prom='';
    switch (piece) {
      case 'wN':
        prom='n';
        break;
      case 'wR':
        prom='r';
        break;
      case 'wB':
        prom='b';
        break;
      case 'bN':
        prom='n';
        break;
      case 'bR':
        prom='r';
        break;
      case 'bB':
        prom='b';
        break;
      default:
        prom='q';
    }
    return (prom);
  };

  function onDrop(source, target, piece){
    if (estado==='juego'){
      try{
        const move= game.move({
          from: source, 
          to: target, 
          promotion: handlePromotion(piece),
        });
        if (move){
          setGame(new Chess(game.fen()));
          if (game.turn()==='b'){
            setNumjugada(numjugada+1);
          }
          if (game.isGameOver()){
            setShowBotonesJuego(false);
          }
        }
        //setTimeout(makeRandomMove,1000);

        if (oponenteMaquina){
          setEstado('pensando');
          console.log(numjugada);

          if (numjugada < 3){
            setTimeout(makeRandomMove,200);
            //console.log("Jugada aleatoria");
            if (game.turn()==='b'){
              setNumjugada(numjugada+1);
            }
            setEstado('juego');
          } else {
            //console.log("Jugada Stockfish");
            const fen=game.fen();
            setTimeout(iniciarAnalisisStockfish(fen),1000);
            setEstado('juego');
          }

        }
      }
      catch(error){
      }
    }
    /*
    if (game.isGameOver()){
      setShowBotonesJuego(false);
    }
    */
    return true;
  };


  const analizaPartida=()=>{
    setMensajeAbandonar('');
    if (estado!=='edicion'){
      setEstado('analisis');
      setShowStockfish(true); 
      setShowBotonesJuego(false);
    }

  };

  const abandonaPartida=()=>{
    if ((estado==='juego')||(estado==='pensando')){
      if (game.turn()==='w'){
        setMensajeAbandonar('Blancas pierden');
      } else {
        setMensajeAbandonar('Negras pierden');
      }
      setEstado('fin');
      setShowBotonesJuego(false);
    }
  };

  const pausaPartida=()=>{
    setEstado('espera');
    setShowBotonesJuego(false);
  };
  
  const cambiaColor = () => {
    setOrient(orient === "white" ? "black" : "white"); 
    if ((estado==='juego') && (oponenteMaquina)){
      //setTimeout(makeRandomMove,500);
      //setTimeout(makeComputerMove,200);
      if (numjugada < 2){
        setTimeout(makeRandomMove,200);
        //console.log("Jugada aleatoria");
        setEstado('juego');
      } else {
        //console.log("Jugada Stockfish");
        const fen=game.fen();
        setTimeout(iniciarAnalisisStockfish(fen),1000);
        setEstado('juego');
      }
    }
  };

  const forzarJugada=()=>{
    if (estado==='juego'){
      //setShowStockfish(false);
      setShowBotonesJuego(true);
      if (estado==='espera'){
        setEstado('juego');
      } 
      if ((estado==='juego')|(estado==='espera')){
        //setTimeout(makeRandomMove,200);
        //setTimeout(makeComputerMove,200);
  
        if (numjugada < 2){
          setTimeout(makeRandomMove,200);
          //console.log("Jugada aleatoria");
          setEstado('juego');

        } else {
          //console.log("Jugada Stockfish");
          const fen=game.fen();
          setTimeout(iniciarAnalisisStockfish(fen),1000);
          setEstado('juego');
        }
      } else if (estado ==='analisis'){
        setEstado('juego');
      }
    }

  };

  const iniciarPosicion=()=>{
    if (estado!=='edicion'){
      setShowStockfish(false);
      setGame(new Chess());
      //setColorTurno('White');
      setEstado('espera');
      setMensajeAbandonar('');
      setNumjugada(0);
      cancelarPeticionStockfish();
    }

  };

  const iniciarPartida=()=>{
    if ((estado !=='fin')&(estado!=='edicion')){
      //setShowStockfish(false);
      setMensajeAbandonar('');
      setShowStockfish(false);
      setShowBotonesJuego(true);
      setEstado('juego');
      setNumjugada(0);
      cancelarPeticionStockfish();
    }
  };

  const editarAplicacion=()=>{
    setEstado('edicion');
    setMensajeAbandonar('');
    //setPiezasEdicion(true);
    setShowStockfish(false);
    setShowBotonesJuego(false);
    setShowBotonesEdicion(true);
    setFenAnterior(game.fen());
    setOponenteAnterior(oponenteMaquina);
    setDepthAnterior(depth);
    setOrientanterior(orient);
  };


  const handleSelectChange=(value)=>{
    setDepth(value);
  };

  //Para cambiar si se juega contra la máquina o contra oponente humano
  const handleCambiarOponente=(value)=>{
    setOponenteMaquina(value);
  };

  const handleOrient=(value)=>{
    setOrient(value);
  };

   //Acepta o cancela el tablero editado
  const handleFenApp=(value)=>{
    //console.log(value);
    try{
      setGame(new Chess(value));
      setEstado('espera');
      setShowBotonesEdicion(false);
      setNumjugada(0);
    } 
    catch(error){
      console.log(error);
    }
  };

  const cancelaEdicion = ()=>{
    setDepth(depthAnterior);
    setOponenteMaquina(oponenteAnterior);
    //setGame(new Chess(fenAnterior));
    setEstado('espera');
    setShowBotonesEdicion(false);
    setOrient(orientAnterior);
  };

  
  return (
    
      <>
        <div className='app'> 
          <h1> ¿Quieres jugar una partida?</h1>
          <div className='contenedor'>
            <div>
              {!showBotonesEdicion &&(
                <div className='botones'>
                  <div className='mensajes'>
                    <ColorBox color={game.turn()==='w'?'white':'black'}/> 
                    <p>{actualizaMensajeJuego(game)}</p>
                    <p>{mensajeAbandonar}</p>
                  </div>
                  <Boton text="Jugar" onClick={iniciarPartida} primaryStyle={estiloBoton} secondaryStyle={estiloBotonHover}/>
                  <Boton text="Forzar jugada" onClick={forzarJugada} primaryStyle={estiloBoton} secondaryStyle={estiloBotonHover}/>
                  <Boton text="Analizar" onClick={analizaPartida} primaryStyle={estiloBoton} secondaryStyle={estiloBotonHover}/>
                  <Boton text="Configuración" onClick={editarAplicacion} primaryStyle={estiloBoton} secondaryStyle={estiloBotonHover}/>       
                  <Boton text="Nueva partida" onClick={iniciarPosicion} primaryStyle={estiloBoton} secondaryStyle={estiloBotonHover}/>
                  <Boton text="Gira el tablero" onClick={cambiaColor} primaryStyle={estiloBoton} secondaryStyle={estiloBotonHover}/>
                </div>
              )}
            </div>
            <div className='tablero'>
              <div className='mensajes'>
                <p>{actualizaMensajeEstado(numjugada,estado,game)}</p>
              </div>
              <div>
                {!showBotonesEdicion &&(
                  <Chessboard
                    id="BoardForPlay"
                    position={game.fen()}
                    boardOrientation={orient}
                    onPieceDrop={onDrop}
                    boardWidth={400}
                  />
                )}            
                {showBotonesEdicion && (
                    <ChessboardComponent posic={game.fen()} tomaFen={handleFenApp} cancelaEd={cancelaEdicion} orientEd={orient} tomaOrientEd={handleOrient}/>
                )}
              </div>
              <div>
                {showStockfish && (
                  <StockfishAPI fen={game.fen()}/>
                )}
              </div>
              <div>
                {showBotonesJuego && (
                  <div className='botones_partida'>
                    <Boton text="Abandonar" onClick={abandonaPartida} primaryStyle={estiloBotonPartida} secondaryStyle={estiloBotonPartidaHover}/>
                    <Boton text="Pausar" onClick={pausaPartida} primaryStyle={estiloBotonPartida} secondaryStyle={estiloBotonPartidaHover}/>
                    {/*<OpeningBookReader/>*/}
                  </div>
                )}
                {showControls && (
                  <div>
                    <Boton text="Pasar" onClick={cancelaEdicion} primaryStyle={estiloBotonPartida} secondaryStyle={estiloBotonPartidaHover}/>
                  </div>
                )}
              </div>
            </div>
            <div className='controles_configuracion'>
              {showBotonesEdicion &&(
                <>
                  <NumberSelector pdepth={depth} onNumberSelected={handleSelectChange}/>
                  <ToggleSwitch text={'Jugar contra la máquina'} checked={oponenteMaquina} onChange={handleCambiarOponente}/>
                  
                </>
              )}
            </div>
          </div>
        </div>        

      </>
   
  );
  
}

export default App;