import React from 'react';

interface HeaderProps{
    title: string;
}

const Header: React.FC<HeaderProps> = (props) => {  // Estou dizendo que a variavel Header é um componente em formato de função, que possui as propriedades estabelecidos em HeaderProps
    return (
        <header>
            <h1>{props.title}</h1>
        </header>
    );
}
export default Header;