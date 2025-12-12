# 🎵 TunerWeb — Afinador Online para Instrumentos (React + TypeScript + Vite)

TunerWeb é um afinador digital de alta precisão desenvolvido com **React**, **TypeScript** e **Vite**, utilizando a **Web Audio API** para detectar notas musicais em tempo real.  
A interface apresenta um medidor semicircular com agulha suave e responsiva, atualizada continuamente conforme a afinação detectada.

---

## 🚀 Demonstração
*(adicione aqui o link quando publicar a aplicação)*

---

## 📸 Screenshot
*(C:\Users\kaell\Music\turner.png)*

---

## 🧭 Funcionalidades
*

```md
![TunerWeb Screenshot](C:\Users\kaell\Music\turner.png)
🧭 Funcionalidades

🎤 Captura áudio do microfone em tempo real

🔎 Detecção de frequência usando algoritmo YIN (preciso e rápido)

🎼 Conversão de frequência → nota musical + oitava

📉 Cálculo de cents (desvio de afinação) com alta precisão

🧭 Ponteiro analógico com rotação suave (interpolação linear)

🌈 Interface com feedback visual:

Verde: afinado

Amarelo: próximo

Vermelho: fora de afinação

📊 Visualizador de forma de onda / frequência

📱 Design responsivo

⚡ Desenvolvimento rápido com Vite

🧩 Código limpo, modular e de fácil manutenção

🛠️ Tecnologias Utilizadas

React 18 (TypeScript)

Vite 4

CSS Modules

Web Audio API

requestAnimationFrame

Algoritmo YIN (pitch detection)

📁 Estrutura do Projeto
src/
├── components/
│   ├── Tuner/
│   │   ├── Tuner.tsx
│   │   └── Tuner.module.css
│   ├── FrequencyVisualizer/
│   ├── Header/
│   └── Footer/
│
├── hooks/
│   └── useMicrophone.ts
│
├── utils/
│   ├── pitchDetection.ts
│   └── musicUtils.ts
│
├── types/
├── styles/
├── main.tsx
└── pages/

⚙️ Instalação e Execução Local
1. Clone o repositório
git clone https://github.com/SEU_USUARIO/TunerWeb.git
cd TunerWeb

2. Instale as dependências
npm install

3. Inicie o ambiente de desenvolvimento
npm run dev


Aplicação disponível em:
📌 http://localhost:5173

🧠 Funcionamento do Afinador

O TunerWeb segue um fluxo contínuo:

1. Captura de áudio

Utiliza getUserMedia para obter o microfone, criando:

AudioContext

AnalyserNode

Buffer de amostras (Float32Array)

2. Leitura da forma de onda

O AnalyserNode fornece dados do domínio do tempo:

getFloatTimeDomainData()

3. Detecção de frequência (algoritmo YIN)

O YIN calcula o período da onda através de auto-correlação cumulativa.
Depois converte:

frequência = sampleRate / atraso

4. Conversão para nota musical

Usa a relação logarítmica:

semitones = 12 * log2(freq / 440)


Extrai:

Nome da nota

Oitava

Cents (desvio da afinação)

5. Rotação da agulha

Cents → Ângulo:

-50 cents → -45°
  0 cents →   0°
+50 cents → +45°

6. Suavização do movimento

A agulha usa interpolação linear para evitar jitter:

lerp(atual, alvo, 0.10)

7. Atualização visual contínua

Executado via:

requestAnimationFrame

🎨 Escalas de cor
Condição	Cents	Cor
Afinado	`	cents
Próximo	`5 <	cents
Fora	> 25	🔴 Vermelho
📦 Build para Produção
npm run build


Servir o build:

npm run preview

🧪 Testes Recomendados

Afinar guitarra, baixo, voz ou teclado

Testar notas graves e agudas

Avaliar estabilidade em ambiente ruidoso

Verificar comportamento em telemóveis

📜 Licença

Licença MIT — uso livre para qualquer finalidade.

👨‍💻 Autor

Desenvolvido por YanMalaquias 
(adicione links para GitHub, LinkedIn ou portfólio)

⭐ Contribuições

Pull requests, issues e melhorias são sempre bem-vindas!
