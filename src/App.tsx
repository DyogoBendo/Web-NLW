import React, { useState } from "react";
import "./App.css";

// JSX: Sintaxe de XML em JavaScript

import Header from "./Header";

// Usamos exatamente como se fosse uma tag HTML, colocando <Header/>

function App() {
  const [counter, setCounter] = useState(0); // retorna um array -> [valor do estado, funcao para atualizar valor do estado]

  function handleButtonClick() {
    setCounter(counter + 1);
  }

  return (
    <div>
      <Header title={`Contador: ${counter}`} />
      <h1>{counter}</h1>
      <button type="button" onClick={handleButtonClick}>
        Aumentar
      </button>
    </div>
  );
}

export default App;
