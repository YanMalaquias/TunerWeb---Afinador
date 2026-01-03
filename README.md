# TunerWeb - Um Afinador Cromático de Alta Precisão para a Web

O TunerWeb é uma aplicação de afinador cromático de código aberto, desenvolvida para oferecer a músicos uma ferramenta rápida, precisa e acessível diretamente no navegador. Construído com as tecnologias mais modernas de desenvolvimento web, ele transforma seu dispositivo em um afinador sensível e confiável, ideal para guitarras, baixos, vocais e uma vasta gama de outros instrumentos.

A aplicação utiliza a **Web Audio API** para processamento de áudio de baixa latência e implementa o robusto algoritmo **YIN** para uma detecção de frequência fundamental extremamente precisa. O resultado é uma experiência de afinação fluida, com um feedback visual intuitivo através de um medidor analógico (gauge) que responde suavemente aos seus ajustes, guiando-o para a nota perfeita sem a tremulação comum em outros afinadores digitais.

Seja você um músico iniciante aprendendo a afinar seu primeiro instrumento ou um profissional que precisa de uma verificação rápida antes de uma apresentação, o TunerWeb oferece uma solução elegante e de alto desempenho.

![Prévia do Afinador](https://i.imgur.com/example.png) <!-- Placeholder para imagem -->

## 🎯 Funcionalidades

- **Detecção de Frequência em Tempo Real**: Captura e processa o áudio do microfone.
- **Alta Precisão**: Utiliza o algoritmo YIN com interpolação parabólica para detecção de pitch sub-harmônico.
- **Conversão para Nota Musical**: Converte a frequência detectada em nota (A, B, C#) e oitava.
- **Medidor de Cents**: Exibe o desvio da afinação em cents (de -50 a +50) para um ajuste fino.
- **Feedback Visual Intuitivo**:
    - Um medidor analógico (gauge) semicircular com um ponteiro que indica o quão perto da afinação correta você está.
    - O ponteiro e o nome da nota mudam de cor (vermelho, amarelo, verde) com base na precisão.
    - Animação de "pulso" quando a nota está perfeitamente afinada.
- **Visualizador de Onda**: Mostra a forma de onda do áudio capturado.
- **Interface Moderna**: Design escuro, legível e responsivo para uso em desktops e dispositivos móveis.
- **Suavização de Movimento**: O ponteiro se move suavemente usando interpolação linear (LERP) para evitar trepidações.

## 🧱 Tecnologias Utilizadas

- **Vite**: Build tool rápida para desenvolvimento web moderno.
- **React 18**: Biblioteca para construção de interfaces de usuário.
- **TypeScript**: Superset de JavaScript que adiciona tipagem estática.
- **CSS Modules**: Para estilos componentizados e isolados.
- **Web Audio API**: Para captura e análise de áudio de baixa latência no navegador.
- **requestAnimationFrame**: Para animações eficientes e suaves.

## 📂 Estrutura do Projeto

O código é organizado de forma modular para facilitar a manutenção e escalabilidade.

```
src/
├── assets/
├── components/
│   ├── App/
│   ├── ErrorBoundary/
│   ├── Footer/
│   ├── FrequencyVisualizer/
│   ├── Header/
│   └── Tuner/
├── hooks/
│   └── useMicrophone.ts
├── styles/
│   └── index.css
├── utils/
│   ├── musicUtils.ts
│   └── pitchDetection.ts
├── main.tsx
└── vite-env.d.ts
```

## 🛠️ Instalação e Execução

Para executar este projeto localmente, siga os passos abaixo.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/tuner-web.git
    cd tuner-web
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    O aplicativo estará disponível em `http://localhost:5173` (ou outra porta, se a 5173 estiver em uso).

4.  **Para gerar uma build de produção:**
    ```bash
    npm run build
    ```
    Os arquivos otimizados serão gerados no diretório `dist/`.

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
*Este `README.md` foi gerado como parte de um projeto de desenvolvimento de software.*
