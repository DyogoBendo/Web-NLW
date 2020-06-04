import React from 'react';
import ReactDOM from 'react-dom'; // digo que estou usando para a web
import App from './App';

ReactDOM.render( // Pedindo para renderizar algo na tela, nesse caso, o App
  <React.StrictMode>
    <App /> 
  </React.StrictMode>,
  document.getElementById('root') // E será renderizado dentro dos elemento que possui o id root
);