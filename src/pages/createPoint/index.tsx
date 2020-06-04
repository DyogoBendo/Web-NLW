import React, { useEffect, useState, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import api from "../../services/api";
import {LeafletMouseEvent} from 'leaflet';
import axios from "axios";

import "./styles.css";
import logo from "../../assets/logo.svg";

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]); // criando um estado para itens
  const [ufs, setUfs] = useState<string[]>([]); // criando um estado para ufs
  const [cities, setCities] = useState<string[]>([]); // criando um estado para cidades

  const [selectedUf, setSelectedUf] = useState("0"); // criando estado para uf selecionada
  const [selectedCity, setSelectedCity] = useState("0"); // criando estado para cidade selecionada
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]); // criando estado para posicao no mapa selecionada
  const [initialPosition, setIniticialPosition] = useState<[number, number]>([0, 0]); // criando estado para posicao inicial no mapa

  // Posicao do usuario assim que ele abre a aplicacao
  useEffect(() =>{
    navigator.geolocation.getCurrentPosition(position =>{ // variavel global, que possui em todo navegadors
      const { latitude, longitude} = position.coords;

      setIniticialPosition([latitude, longitude])
    }) 
  }, []);

  // Pegar os itens
  useEffect(() => {
    api.get("items").then((response) => {
      setItems(response.data);
    }); // usamos uma promise
  }, []); //Primeiro parametro -> qual funcao eu quero executar e o segundo eh quando quero executa-la. Ao nao colocar nada no segundo parametro, ele eh executado uma unica vez apenas, quando o componente eh criado

  // Pegar os estados
  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      )
      .then((response) => {
        const ufInitials = response.data.map((uf) => uf.sigla);

        setUfs(ufInitials);
      });
  }, []);

  // Pegar os municipios
  useEffect(() => {
    if (selectedUf === "0") return;
    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then((response) => {
        const cityName = response.data.map((cidade) => cidade.nome);

        setCities(cityName);
      });
  }, [selectedUf]); // carregar as cidades sempre que for selecionada uma nova UF


  // Lidando com a Uf selecionada
  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    // preciso informar que estou alterando um HTML selected Element
    const uf = event.target.value;
    setSelectedUf(uf);
  }

  // Lidando com o municipio selecionado
  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    // preciso informar que estou alterando um HTML selected Element
    const city = event.target.value;
    setSelectedCity(city);
  }

  // Lidando com uma selecao no mapa
  function handleMapClick(event: LeafletMouseEvent){
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

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

          <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
            {" "}
            /** Recebe um array: Primeiro valor latitude, segundo valor
            longitude */
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado(UF)</label>
              <select
                name="uf"
                id="uf"
                value={selectedUf}
                onChange={handleSelectUf}
              >
                <option value="0">Selecione uma UF</option>
                {ufs.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
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
            {items.map((item) => (
              <li key={item.id}>
                {" "}
                {/** Precisamos indicar um valor unico de cada item */}
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}{" "}
            {/** Percorre item por item */}
          </ul>
        </fieldset>
        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
