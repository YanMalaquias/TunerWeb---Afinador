# Instruções para Continuação do Projeto com Gemini

## 📋 Visão Geral do Projeto

**Objetivo**: Aplicação web de afinador de instrumentos musicais (`TunerWeb`), com interface visual moderna, construída com React 18, TypeScript e Vite.

**Status**: Aplicação feature-complete, com detecção de pitch, medidor de afinação (gauge) e visualizador de forma de onda.

**Localização**: `c:\Users\kaell\Music\web-tuner-app\`

**URL Local**: Acessível via `http://localhost:5173/` (após iniciar com `npm run dev`).

---

## 🏗️ Arquitetura do Projeto

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Estilo**: CSS Modules para componentização de estilos.
- **Web Audio**: `AudioContext` + `AnalyserNode` (FFT de 4096 pontos).

### Estrutura de Diretórios
```
web-tuner-app/
├── src/
│   ├── components/
│   │   ├── App.tsx                 (Componente raiz que integra a aplicação)
│   │   ├── App.module.css
│   │   ├── ErrorBoundary.tsx       (Tratamento de erros)
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Tuner/                  (Componente principal do afinador com o gauge SVG)
│   │   └── FrequencyVisualizer/    (Canvas para visualização da onda)
│   ├── hooks/
│   │   └── useMicrophone.ts        (Gerencia o acesso ao microfone e a Web Audio API)
│   ├── utils/
│   │   ├── pitchDetection.ts       (Algoritmo YIN para detecção de pitch)
│   │   └── musicUtils.ts           (Converte frequência para nota musical)
│   ├── styles/
│   │   └── index.css               (Estilos globais e tema)
│   └── main.tsx                    (Ponto de entrada da aplicação React)
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 🔊 Pipeline de Processamento de Áudio

### 1. Captura de Áudio (`hooks/useMicrophone.ts`)
- **Retorno do Hook**:
  ```typescript
  {
    analyserNode: AnalyserNode | null;
    audioBuffer: Float32Array | null;
    permissionState: 'idle' | 'prompt' | 'granted' | 'denied';
    error: string | null;
    startListening: () => Promise<void>;
    stopListening: () => void;
  }
  ```
- **Configuração**:
  - `fftSize`: 4096 (alta resolução de frequência).
  - `smoothingTimeConstant`: 0.2 (resposta rápida).
  - Áudio não é conectado aos alto-falantes, apenas para análise.

### 2. Detecção de Pitch (`utils/pitchDetection.ts`)
- **Algoritmo**: YIN (implementado com CMNDF).
- **Threshold**: `0.12`.
- **Faixa de Frequência**: 50-1200 Hz.
- **Refinamento**: Interpolação parabólica para precisão sub-harmônica.
- **Entrada**: `Float32Array` de `getFloatTimeDomainData()`.
- **Saída**: Frequência em Hz ou `null`.

### 3. Mapeamento Frequência → Nota (`utils/musicUtils.ts`)
- **Interface**:
  ```typescript
  interface NoteData {
    note: string;
    octave: number;
    cents: number;
    frequency: number;
  }
  ```
- **Referência**: A4 = 440 Hz.
- **Cents**: Desvio de -50 a +50 do semitom mais próximo.

### 4. Feedback Visual (`components/Tuner/Tuner.tsx`)
- **Animação**: Atualizações via `requestAnimationFrame` para suavidade.
- **Gauge**: Medidor SVG com ponteiro (needle) que gira de -45° a +45°.
- **Suavização**: Rotação do ponteiro utiliza Interpolação Linear (LERP) para evitar trepidações.
- **Cores Dinâmicas**: A cor da nota e do gauge muda (vermelho, amarelo, verde) com base na afinação.
- **Animação de Afinação**: Efeito "pulse" no centro do ponteiro quando a nota está afinada (`|cents| <= 5`).

---

## ✅ Funcionalidades Implementadas

- **Criação Completa do Projeto**: Estrutura do projeto `TunerWeb` criada do zero.
- **Captura de Microfone**: Hook `useMicrophone` robusto com gerenciamento de permissões e erros.
- **Detecção de Pitch**: Implementação do algoritmo YIN.
- **Conversão Musical**: Utilitários para converter frequência em nota e cents.
- **UI Moderna**:
  - Gauge SVG semicircular com ponteiro analógico.
  - Feedback visual claro com cores e animações.
  - Visualizador de forma de onda em tempo real.
- **Correção de Bugs**: Resolvidos múltiplos erros de build do Vite relacionados a caminhos de importação.
- **Documentação**:
  - `README.md` profissional criado.
  - Mensagem de commit detalhada elaborada.
  - Documentos de instrução de IA (`copilot-instructions.md`, `gemini-instructions.md`) atualizados.

---

## 🚀 Como Iniciar

### Setup
```bash
cd web-tuner-app
npm install
npm run dev
```
O servidor de desenvolvimento iniciará, e a aplicação estará disponível em `http://localhost:5173/`.

### Build para Produção
```bash
npm run build
```

---

## 📝 Próximos Passos Sugeridos

1.  **Melhorar o `FrequencyVisualizer`**: Alterar para um histograma de frequência (`getByteFrequencyData`) em vez da forma de onda.
2.  **Adicionar Seletor de Afinações**: Implementar botões para afinações padrão (guitarra, baixo, etc.).
3.  **Customizar Frequência de Referência (A4)**: Adicionar um input para alterar a frequência de A4 (e.g., 432 Hz).

---

## 🔧 Configurações Críticas

- **YIN Threshold (`pitchDetection.ts` -> `getPitch`)**: `threshold = 0.12`
- **FFT Size (`useMicrophone.ts`)**: `fftSize = 4096`
- **LERP Smoothing (`App.tsx`)**: `lerp(current, target, 0.1)`

---

## 👤 Contato & Contexto

**Última atualização**: 3 de Janeiro de 2026
**Desenvolvido com**: Gemini
**Para continuar**: Leia este arquivo e `copilot-instructions.md` antes de fazer mudanças.
