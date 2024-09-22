import React from 'react';
import {useState} from 'react';
import {Chessboard} from 'react-chessboard';
import imagenPeonBlanco from './images/Chess_plt60.png';
import imagenReyBlanco from './images/Chess_klt60.png';
import imagenReinaBlanco from './images/Chess_qlt60.png';
import imagenAlfilBlanco from './images/Chess_blt60.png';
import imagenTorreBlanco from './images/Chess_rlt60.png';
import imagenCaballoBlanco from './images/Chess_nlt60.png';
import imagenPeonNegro from './images/Chess_pdt60.png';
import imagenReyNegro from './images/Chess_kdt60.png';
import imagenReinaNegro from './images/Chess_qdt60.png';
import imagenAlfilNegro from './images/Chess_bdt60.png';
import imagenTorreNegro from './images/Chess_rdt60.png';
import imagenCaballoNegro from './images/Chess_ndt60.png';


const Boton = ({ text, onClick, primaryStyle, secondaryStyle }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  return (
    <button 
      onClick={onClick} 
      style={isHovered ? secondaryStyle : primaryStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {text}
    </button>
  );
}


const ColorBox = ({ color }) => {
  return (
    <div
      style={{
        width: '20px',
        height: '20px',
        backgroundColor: color,
        border: '2px solid blue',
        display: 'inline-block',
        margin: '4px',
      }}
    />
  );
}

//Menú desplegable que permite seleccionar un elemento de una matriz
const LetterSelector = ({rank, array, onLetterSelected}) => {
  const [selectedLetter, setSelectedLetter] = useState(rank);

  const handleLetterChange = (event) => {
    setSelectedLetter(event.target.value);
    onLetterSelected(event.target.value);
  };

  return (
    <div className="menu-config">
      <select id="letter-selector" value={selectedLetter} onChange={handleLetterChange}>
        {array.map((letter) => (
          <option key={letter} value={letter}>
            {letter}
          </option>
        ))}
      </select>
      <label htmlFor="letter-selector">Columna de captura al paso</label>
    </div>
  );
};


//Menú desplegable que permite seleccionar un número del 1 al 15
const NumberSelector = ({pdepth, onNumberSelected}) => {
  const [selectedNumber, setSelectedNumber] = useState(pdepth);

  const handleNumberChange = (event) => {
    setSelectedNumber(parseInt(event.target.value));
    onNumberSelected(event.target.value);
  };

  return (
    <div className="menu-config">
      <select id="number-selector" value={selectedNumber} onChange={handleNumberChange}>
        {Array.from({ length: 15 }, (_, i) => i + 1).map((number) => (
          <option key={number} value={number}>
            {number}
          </option>
        ))}
      </select>
      <label htmlFor="number-selector">Selecciona nivel de Stockfish</label>
      
    </div>
  );
};

const ToggleSwitch = ({text, checked, onChange}) => (
  <div className="menu-configuracion">
    <input
      type="checkbox"
      className="toggle-switch-checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
    />
    <label className="toggle-switch-label">{text}</label>
  </div>
);

const SparePieces = ({ pieces, onPieceDrag }) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: '2px' }}>
      {Object.keys(pieces).map((piece) => (
        <div
          key={piece}
          style={{
            width: '40px',
            height: '40px',
            backgroundImage: `url(${pieces[piece]})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            margin: '5px',
            cursor: 'pointer',
          }}
          onClick={() => onPieceDrag(piece)}
        />
      ))}
    </div>
  );
};


//Tablero editable para poder poner la posición que uno quiera
const ChessboardComponent=(props)=> {
  //const [fenPosition,setFenPosition] = useState(props.posic);
  //let fenPosition=props.posic;
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const capturasPaso = ['-','a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  
  const piecesPositionToFen={wK: 'K', wQ: 'Q', wB: 'B', wN: 'N', wR: 'R',wP: 'P', bK: 'k', bQ: 'q', bB: 'b', bN: 'n', bR: 'r',bP: 'p' };
  const piecesFenToPosition={K: 'wK', Q: 'wQ', R: 'wR', B: 'wB', N: 'wN', P: 'wP', k: 'bK', q: 'bQ', r: 'bR', b: 'bB', n: 'bN', p: 'bP'};
  const [posicion,setPosicion]=useState(fenToPositionObject(props.posic));
  const [orient,setOrient] = useState(props.orientEd); 
  //Pieza de reserva que se escoge para poner en el tablero
  const [piezaReserva, setPiezaReserva]=useState('');
  const [imagenPiezaReserva,setImagenPiezaReserva]=useState(null);
  // 0-0, 0-0-0 y turno en la edición de posiciones
  const [enroqueCortoBlancas,setEnroqueCortoBlancas]=useState(extraeEnroqueCortoBlancasFen(props.posic));
  const [enroqueCortoNegras,setEnroqueCortoNegras]=useState(extraeEnroqueCortoNegrasFen(props.posic));
  const [enroqueLargoBlancas,setEnroqueLargoBlancas]=useState(extraeEnroqueLargoBlancasFen(props.posic));
  const [enroqueLargoNegras,setEnroqueLargoNegras]=useState(extraeEnroqueLargoNegrasFen(props.posic));
  const [turnoNegras, setTurnoNegras] = useState(extraeTurnoFen(props.posic));
  const [columnaCapturaPaso, setColumnaCapturaPaso]=useState(extraeCapturaPasoFen(props.posic));


  //Para que la imagen de la pieza siga al cursor
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };

  //Piezas de repuesto para editar el tablero
  const [sparePiecesW, setSparePiecesW] = useState({
    P: imagenPeonBlanco,
    K: imagenReyBlanco,
    Q: imagenReinaBlanco,
    B: imagenAlfilBlanco,
    R: imagenTorreBlanco,
    N: imagenCaballoBlanco,
    //P: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Chess_plt60.png',
    //K: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Chess_klt60.png',
    //Q: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Chess_qlt60.png',
    //B: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Chess_blt60.png',
    //R: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Chess_rlt60.png',
    //N: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Chess_nlt60.png',
  });

  const [sparePiecesB, setSparePiecesB] = useState({
    p: imagenPeonNegro,
    k: imagenReyNegro,
    q: imagenReinaNegro,
    b: imagenAlfilNegro,
    r: imagenTorreNegro,
    n: imagenCaballoNegro,
    //p: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Chess_pdt60.png',
    //k: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Chess_kdt60.png',
    //q: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Chess_qdt60.png',
    //b: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Chess_bdt60.png',
    //r: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Chess_rdt60.png',
    //n: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Chess_ndt60.png',
  });
  

  const rojoClaro = 'rgb(250, 250, 150)';
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

  
  function extraeEnroqueCortoBlancasFen(fen){
    const enroques=fen.split(' ');
    let posicion=enroques[2].indexOf('K');
    return(posicion!==-1?true:false);
    
  };

  function extraeEnroqueLargoBlancasFen(fen){
    const enroques=fen.split(' ');
    let posicion=enroques[2].indexOf('Q');
    return(posicion!==-1?true:false);
    
  };

  function extraeEnroqueCortoNegrasFen(fen){
    const enroques=fen.split(' ');
    let posicion=enroques[2].indexOf('k');
    return(posicion!==-1?true:false);
    
  };

  function extraeEnroqueLargoNegrasFen(fen){
    const enroques=fen.split(' ');
    let posicion=enroques[2].indexOf('q');
    return(posicion!==-1?true:false);
    
  };

  function extraeTurnoFen(fen){
    const cadena=fen.split(' ');
    return(cadena[1]==='b'? true:false);
  };

  function extraeCapturaPasoFen(fen){
    const cadena=fen.split(' ');
    return (cadena[3].charAt(0));
  };

  function fenToPositionObject(fen) {
    // Dividir la cadena FEN en sus partes
    const fenParts = fen.split(' ');
    
    // Extraer la información relevante de las partes
    const pieces = fenParts[0].split('/');
    /*
    const turn = fenParts[1];
    const castling = fenParts[2];
    const enPassant = fenParts[3];
    const halfmoves = parseInt(fenParts[4]);
    const fullmoves = parseInt(fenParts[5]);
    */

    // Crear el objeto de posición
    //const positionObject = {};
    
    // Construir el objeto de piezas
    const boardObject = {};
    for (let rank = 0; rank < 8; rank++) {
      let file=0;
      for (let f = 0; f<pieces[rank].length; f++) {
        const lectura = pieces[rank][f];
        if (lectura==='1' | lectura==='2' | lectura==='3' | lectura==='4' | lectura==='5' | lectura==='6' | lectura==='7'){
          file=file+parseInt(lectura);
        } else if (lectura !== '8') {
          const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
          const piece = lectura;
          ++file;
          boardObject[square] = piecesFenToPosition[piece];
        }
      }
    }
    //positionObject.board = boardObject;
    // Agregar el resto de la información
    /*
    positionObject.turn = turn;
    positionObject.castling = castling;
    positionObject.enPassant = enPassant === '-' ? null : enPassant;
    positionObject.halfmoves = halfmoves;
    positionObject.fullmoves = fullmoves;
    */
  
    //return positionObject;
    return boardObject;
  };
  
  function objectToFen(positionObject) {
    let fen = '';
  
    // Construir la cadena de piezas
    for (let rank = 8; rank >= 1; rank--) {
      let emptySquares = 0;
      for (let i = 0; i < letters.length; i++) {
        const square = `${letters[i]}${rank}`;
        const piece = positionObject[square];
        if (piece) {
          if (emptySquares > 0) {
            fen += emptySquares;
            emptySquares = 0;
          }
          fen += piecesPositionToFen[piece];
        } else {
          emptySquares++;
        }
      }
      if (emptySquares > 0) {
        fen += emptySquares;
      }
      if (rank > 1) {
        fen += '/';
      }
    }
  
    // Agregar el turno
    //fen += ' ' + (positionObject.turn === 'w' ? 'w' : 'b');
    fen += ' ' + (turnoNegras ? 'b' : 'w');

    // Agregar el estado de enroque
    //fen += ' ' + (positionObject.castling || '-');
    fen += ' ' + (enroquesFen());

    // Agregar el peón al paso
    //fen += ' ' + (positionObject.epSquare || '-');
    fen += ' ' + capturaPasoFen();

    // Agregar el contador de movimientos
    fen += ' ' + (positionObject.halfMoves || '0');
  
    // Agregar el número de movimiento
    fen += ' ' + (positionObject.fullMoves || '1');
  
    return fen;
  };

  function capturaPasoFen(){
    let cadena='';
    if (columnaCapturaPaso!=='-'){
      cadena= (turnoNegras? columnaCapturaPaso + 3 : columnaCapturaPaso + 6);
    } else {
      cadena=columnaCapturaPaso;
    }
    //console.log(cadena);
    return cadena;

  };

  function enroquesFen(){
    let cadena='';
    if (enroqueCortoBlancas){
      cadena += 'K';
    }
    if (enroqueLargoBlancas){
      cadena += 'Q';
    }
    if (enroqueLargoNegras){
      cadena += 'q';
    }
    if (enroqueCortoNegras){
      cadena += 'k';
    }
    if (!enroqueLargoBlancas && !enroqueLargoNegras && !enroqueCortoBlancas && !enroqueCortoNegras){
      cadena = '-';
    }
    return cadena;
  };

  const limpiaTablero=()=>{
    //setGame(new Chess('4k3/8/8/8/8/8/8/4K3 w - - 0 1'));
    setPosicion({});
    setEnroqueLargoBlancas(false);
    setEnroqueCortoBlancas(false);
    setEnroqueLargoNegras(false);
    setEnroqueCortoNegras(false);
  };

  const girarTablero = () => {
    let orientacionAux=(orient === "white" ? "black" : "white");
    setOrient(orientacionAux);
    props.tomaOrientEd(orientacionAux);
  };

  const iniciarTablero = () => {
    setPosicion('start');
  };
  
  const aceptarPosicion = () => {
    props.tomaFen(objectToFen(posicion));
  };

const cancelarPosicion = () => {
    props.cancelaEd();
  };
  
  const handleBoardDrag=()=>{
    setPiezaReserva('');
    setImagenPiezaReserva(null);
  };

  const handleDrag = (piece) => {
    if (piezaReserva===''){
      setPiezaReserva(piece);
      if (piece===piece.toLowerCase()){
        setImagenPiezaReserva(sparePiecesB[piece]);
        //setImagenPiezaReserva(imagenAlfilNegro);
      }else{
        setImagenPiezaReserva(sparePiecesW[piece]);
        //setImagenPiezaReserva(imagenAlfilBlanco);
      }
    }else{
      setPiezaReserva('');
      setImagenPiezaReserva(null);
    }
  };

  const handleFen = (position) => {
    //setFenPosition(objectToFen(position));
    setPosicion(position);
  };

  const handleClick = (square) => {
    if (piezaReserva!==''){
      if (posicion[square]){
        let newPosicion={...posicion};
        delete newPosicion[square];
        setPosicion(newPosicion);
      } else {
        const newElement={key: square, value: piecesFenToPosition[piezaReserva]};
        const nuevaPosicion={...posicion,[newElement.key]:newElement.value};
        setPosicion(nuevaPosicion);
      }
    }
  };

  const cambiaEnroqueLargoBlancas=(checked)=>{
    setEnroqueLargoBlancas(checked);
    //setFenPosition(objectToFen(posicion));
  };
  const cambiaEnroqueCortoBlancas=(checked)=>{
    setEnroqueCortoBlancas(checked);
    //setFenPosition(objectToFen(posicion));
  };
  const cambiaEnroqueLargoNegras=(checked)=>{
    setEnroqueLargoNegras(checked);
    //setFenPosition(objectToFen(posicion));
  };
  const cambiaEnroqueCortoNegras=(checked)=>{
    setEnroqueCortoNegras(checked);
    //setFenPosition(objectToFen(posicion));
  };

  const cambiaTurno=(checked)=>{
    setTurnoNegras(checked);
    //setFenPosition(objectToFen(posicion));
  };

  const cambiaCapturaPaso=(value)=>{
    setColumnaCapturaPaso(value);
    //setFenPosition(objectToFen(posicion));
  };

  return (
    <div className='tablero' onMouseMove={handleMouseMove}>
      <Chessboard
        //ref={boardEd}
        id="BoardForEdition"
        position={posicion}
        boardOrientation={orient}
        boardWidth={300}
        getPositionObject={handleFen}
        onSquareClick={handleClick}
        onPieceDragBegin={handleBoardDrag}
      />
      {/*<p> FEN:{fenPosition} </p>*/}
      <SparePieces pieces={sparePiecesW} onPieceDrag={handleDrag}/>
      <SparePieces pieces={sparePiecesB} onPieceDrag={handleDrag}/>
      <div className='botones_partida'>
        <ToggleSwitch text={'0-0 blancas'} checked={enroqueCortoBlancas} onChange={cambiaEnroqueCortoBlancas} />
        <ToggleSwitch text={'0-0-0 blancas'} checked={enroqueLargoBlancas} onChange={cambiaEnroqueLargoBlancas} />
        <ToggleSwitch text={'0-0 negras'} checked={enroqueCortoNegras} onChange={cambiaEnroqueCortoNegras} />
        <ToggleSwitch text={'0-0-0 negras'}checked={enroqueLargoNegras} onChange={cambiaEnroqueLargoNegras} />
      </div>
      <div className='botones_partida'>
        <ToggleSwitch text={'Juegan negras'} checked={turnoNegras} onChange={cambiaTurno} />
        <LetterSelector rank={columnaCapturaPaso} array={capturasPaso} onLetterSelected={cambiaCapturaPaso}/>

      </div>
      <div className='botones_partida'>
        <Boton text="Aceptar" onClick={aceptarPosicion} primaryStyle={estiloBotonPartida} secondaryStyle={estiloBotonPartidaHover}/>
        <Boton text="Iniciar" onClick={iniciarTablero} primaryStyle={estiloBotonPartida} secondaryStyle={estiloBotonPartidaHover}/>
        <Boton text="Clear" onClick={limpiaTablero} primaryStyle={estiloBotonPartida} secondaryStyle={estiloBotonPartidaHover}/>
        <Boton text="Girar tablero" onClick={girarTablero} primaryStyle={estiloBotonPartida} secondaryStyle={estiloBotonPartidaHover}/>
        <Boton text="Cancelar" onClick={cancelarPosicion} primaryStyle={estiloBotonPartida} secondaryStyle={estiloBotonPartidaHover}/>
      </div>

      <img
        src={imagenPiezaReserva ? imagenPiezaReserva : null}       
        style={{
          position: 'absolute',
          left: cursorPosition.x,
          top: cursorPosition.y,
          transform: `translate(-50%, -50%) scale(0.5)`,
          pointerEvents: 'none',
        }}
      />
    </div>
    
  );
};

export {Boton,ColorBox,NumberSelector,ToggleSwitch,SparePieces,ChessboardComponent};




