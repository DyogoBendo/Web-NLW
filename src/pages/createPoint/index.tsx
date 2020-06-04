import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import api from "../../services/api";

import "./styles.css";
import logo from "../../assets/logo.svg";

interface Item{
  id: number;
  title: string;
  image_url: string;
}

const CreatePoint = () => {

  const [items, setItems] = useState<Item[]>([]); // criando um estado


  useEffect(() => {
    api.get("items").then((response) => {
      setItems(response.data)
    }); // usamos uma promise
  }, []); //Primeiro parametro -> qual funcao eu quero executar e o segundo eh quando quero executa-la. Ao nao colocar nada no segundo parametro, ele eh executado uma unica vez apenas, quando o componente eh criado

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para a home
        </Link>
      </header>
      <form>
        <h1>
          Cadastro do <br /> ponto de coletas
        </h1>
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name"> Nome da entidade</label>
            <input type="text" name="name" id="name" />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email"> E-mail</label>
              <input type="email" name="email" id="email" />
            </div>
            <div className="field">
              <label htmlFor="whats"> Whatsapp</label>
              <input type="text" name="whats" id="whats" />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço do mapa</span>
          </legend>

          <Map center={[-25.4430381, -54.4013914]} zoom={15}>
            {" "}
            /** Recebe um array: Primeiro valor latitude, segundo valor
            longitude */
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[-25.4430381, -54.4013914]} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado(UF)</label>
              <select name="uf" id="uf">
                <option value="0">Selecione uma UF</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city">
                <option value="0">Selecione uma cidade</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map(item => (
              <li key={item.id}> {/** Precisamos indicar um valor unico de cada item */}
              <img
                src={item.image_url}
                alt={item.title}
              />
              <span>{item.title}</span>
            </li>
            ))} {/** Percorre item por item */}
            
          </ul>
        </fieldset>
        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
