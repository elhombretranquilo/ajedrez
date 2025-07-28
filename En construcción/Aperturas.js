import React, { useState, useEffect } from 'react';
//import Polyglot from 'node-polyglot';
import libro_aperturas from './books/Prueba.bin';

const OpeningBookReader = () => {
  const [polyglot, setPolyglot] = useState(null);
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [move, setMove] = useState('');

  useEffect(() => {
    // Inicializar Polyglot
    const poly = new Polyglot();
    
    // Cargar el libro de aperturas (esto es un ejemplo, deberías cargar tu propio archivo)
    const openingBook = {
      'e2e4': 'Apertura del peón de rey',
      'd2d4': 'Apertura del peón de dama',
      // Añade más movimientos y sus descripciones aquí
    };
    
    poly.extend(openingBook);
    setPolyglot(poly);
  }, []);

  const handleFenChange = (e) => {
    setFen(e.target.value);
  };

  const lookupMove = () => {
    if (polyglot) {
      const hash = polyglot.hash(fen);
      //const bestMove = polyglot.find(fen, 'tu_libro_de_aperturas.bin', true);
      const bestMove = polyglot.find(fen, libro_aperturas, true);
      setMove(bestMove ? polyglot.t(bestMove) : 'Movimiento no encontrado');
    }
  };

  return (
    <div>
      <h1>Lector de Libro de Aperturas Polyglot</h1>
      <input 
        type="text" 
        value={fen} 
        onChange={handleFenChange} 
        placeholder="Introduce la posición FEN"
      />
      <button onClick={lookupMove}>Buscar movimiento</button>
      <p>Movimiento sugerido: {move}</p>
    </div>
  );
};

export default OpeningBookReader;