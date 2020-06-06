import React, { useEffect, useState, ChangeEvent, FormEvent} from "react";
import { Link, useHistory} from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import api from "../../services/api";
import { LeafletMouseEvent } from "leaflet";
import axios from "axios";
import Dropzone from '../../components/Dropzone';
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
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]); // criando estado para posicao no mapa selecionada
  const [initialPosition, setIniticialPosition] = useState<[number, number]>([
    0,
    0,
  ]); // criando estado para posicao inicial no mapa
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  }); // criando estado para dados de formulario
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();
  const history = useHistory();

  // Posicao do usuario assim que ele abre a aplicacao
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      // variavel global, que possui em todo navegadors
      const { latitude, longitude } = position.coords;

      setIniticialPosition([latitude, longitude]);
    });
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
  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }

  // lidando com os campos de formulario
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value }); // name nesse caso fica como nome do atributo que sera modificado
  }

  // lidando com os itens selecionados
  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id); // procura o index do item

    if(alreadySelected >= 0){ // se existir
      const filteredItems = selectedItems.filter(item => item !== id); // pega um array com todos os elementos, menos o que possui o id que foi passado

      setSelectedItems(filteredItems); 
    }else{ // senao so adiciona
      setSelectedItems([...selectedItems, id]);
    }
    
  }

  // lidando com submit
  async function handleSubmit(event: FormEvent){ // padrao de formulario é enviar para outra página ao dar submit. Queremos evitar isso
    event.preventDefault();

    const {name, email, whatsapp} = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();
      data.append('name', name )
      data.append('email', email)
      data.append('whatsapp', whatsapp )
      data.append('uf', uf)
      data.append('city', city)
      data.append('latitude', String(latitude))
      data.append('longitude', String(longitude))
      data.append('items', items.join(','))
      if(selectedFile){
        data.append('image', selectedFile)
      }

    await api.post('points', data); // passando os dados para o backend

    alert('Cadastrado com sucesso!');

    history.push('/'); // mandando usuario para a home
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
      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br /> ponto de coletas
        </h1>
        <Dropzone onFileUploaded={setSelectedFile} />
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name"> Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email"> E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp"> Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
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
              <li
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id)? 'selected':'' /** checa se o item ja foi selecionado */}
              >
                {/**Sempre que quero passar um parametro para uma funcao, preciso criar uma arrow function */}
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
