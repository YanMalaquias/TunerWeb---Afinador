# Instruções para Continuação do Projeto Web Tuner com Gemini

## 📋 Visão Geral do Projeto

**Objetivo**: Aplicação web de afinador de instrumentos musicais com interface visual moderna usando React 18 + TypeScript + Vite.

**Status**: Aplicação funcionando com needle gauge (ponteiro tipo relógio) e animação de afinação.

**Localização**: `C:\Users\kaell\Music\my-nextjs-app\`

**URL Local**: `http://localhost:5173/` (iniciar com `npm run dev`)

---

## 🏗️ Arquitetura do Projeto

### Stack Tecnológico
- **Frontend**: React 18.2.0 + TypeScript 5.4+
- **Bundler**: Vite 4.4.9
- **Estilo**: CSS Modules (componentes isolados)
- **Web Audio**: AudioContext + AnalyserNode (FFT de 4096 pontos)

### Estrutura de Diretórios
```
my-nextjs-app/
├── src/
│   ├── components/
│   │   ├── App.tsx                 (Root component, layout principal)
│   │   ├── App.css                 (Estilos globais)
│   │   ├── Header/
│   │   │   ├── Header.tsx          (Título "Web Tuner")
│   │   │   └── Header.module.css
│   │   ├── Tuner/
│   │   │   ├── Tuner.tsx           (Componente principal do afinador)
│   │   │   └── Tuner.module.css    (Estilos do needle gauge + animação)
│   │   ├── FrequencyVisualizer/
│   │   │   └── FrequencyVisualizer.tsx (Canvas para waveform)
│   │   └── Footer/
│   │       ├── Footer.tsx
│   │       └── Footer.module.css
│   ├── hooks/
│   │   └── useMicrophone.ts        (Gerencia microfone + Web Audio API)
│   ├── utils/
│   │   ├── pitchDetection.ts       (Algoritmo YIN para detecção de pitch)
│   │   └── musicUtils.ts           (Conversão frequência → nota musical)
│   ├── types/
│   │   └── index.ts                (Tipos compartilhados)
│   ├── styles/
│   │   └── index.css
│   ├── main.tsx                    (Bootstrap React 18)
│   └── pages/
│       └── index.tsx               (Page wrapper)
├── index.html                      (Entry point HTML)
├── package.json
├── vite.config.ts                  (Configuração Vite)
├── tsconfig.json                   (TypeScript strict mode)
└── .github/
    └── copilot-instructions.md     (Documentação detalhada da arquitetura)
```

---

## 🔊 Pipeline de Processamento de Áudio

### 1. Captura de Áudio (`useMicrophone.ts`)
```typescript
// Hook retorna:
{
  stream: MediaStream | null
  audioContext: AudioContext | null
  analyserNode: AnalyserNode | null
  isListening: boolean
  isLoading: boolean
  permissionStatus: 'prompt' | 'granted' | 'denied' | undefined
  error: Error | null
  startListening(): Promise<void>
  stopListening(): void
  getFloatFrequencyData(): Float32Array | null
  getByteFrequencyData(): Uint8Array | null
  getTimeDomainData(): Float32Array | null
}
```

**Configuração:**
- FFT Size: 4096 (resolução de frequência alta, ~10 Hz por bin em 44.1 kHz)
- Smoothing constant: 0.2 (resposta rápida sem jitter)
- Sem conexão com speakers (dados apenas para análise)

### 2. Detecção de Pitch (`pitchDetection.ts`)
**Algoritmo**: YIN (Yin Is Not A Harmonic Spectral Pitch Detector)
- Implementação com CMNDF (Cumulative Mean Normalized Difference Function)
- Threshold: 0.12 (valores altos = mais confiável, menos sensível)
- Faixa de frequência: 50-1200 Hz (instrumentos/voz)
- Decimação adaptativa para ~2048 amostras
- Refinamento: Interpolação parabólica (±1 semitom de precisão)

**Entrada**: Float32Array de `getTimeDomainData()`
**Saída**: Frequência em Hz ou `null` (se não detectada)

### 3. Mapeamento Frequência → Nota (`musicUtils.ts`)
```typescript
interface NoteResult {
  note: string;      // "C", "C#", "D", ..., "B"
  octave: number;    // 0-8 (A4 = octave 4)
  cents: number;     // -50 a +50 (offset do semitom mais próximo)
}

function getNoteFromFrequency(frequency: number): NoteResult | null
```

**Referência**: A4 = 440 Hz (padrão internacional)
**Cents**: Unidade de tuning musical; ±50 cents = ±1 semitom

### 4. Feedback Visual (`Tuner.tsx`)
- Atualização a 30 FPS via `requestAnimationFrame`
- Detecção de silêncio por RMS (threshold 0.001)
- Exibição: nota, frequência em Hz, offset em cents
- Controles: botões Start/Stop para microfone

---

## 🎨 Interface Visual - Painel de Instrumentos (Estilo Cifra Club)

A interface foi completamente redesenhada para se assemelhar a um medidor de painel de carro, similar ao do Cifra Club, focando em clareza e funcionalidade.

### Layout Principal (`Tuner.css`)
```css
.tuner-container (flex column, centralizado)
  ↓
  ├─ .note-display (Exibe a nota detectada, muda de cor)
  │
  └─ .gauge-container
     └─ .gauge-body (Semicírculo que forma o corpo do medidor)
        ├─ .gauge-needle (Ponteiro que gira para indicar a afinação)
        └─ .gauge-center-dot (Ponto central do ponteiro)
```

### Estados Visuais
| Condição | Visual | Animação |
|----------|--------|----------|
| Silêncio | Nota "—", needle em 0° | Nenhuma |
| Longe (±45-50¢) | Needle nos extremos, zona vermelha | Sem animação |
| Próximo (±15-45¢) | Needle na zona amarela | Sem animação |
| Afinado (\|cents\| ≤ 5) | Needle verde central | Pulse 1.2s (cap pulsa) |

### Animação `tunedPulse`
```css
@keyframes tunedPulse {
  0%   { box-shadow: 0 0 24px rgba(34,197,94,0.8), ... }
  50%  { box-shadow: 0 0 32px rgba(34,197,94,1.0), ... }  /* brilho máximo */
  100% { box-shadow: 0 0 24px rgba(34,197,94,0.8), ... }
}
/* Duração: 1.2s, infinita quando afinado */
```

---

## 🎯 Funcionalidades Implementadas

✅ **Captura de microfone** com tratamento de erros (NotAllowedError, NotFoundError)
✅ **Detecção de pitch** via algoritmo YIN
✅ **Mapping frequência↔nota** com precisão em cents
✅ **Needle gauge** com rotação suave (±45°)
✅ **SVG arcs** com zonas coloridas (verde/amarelo/vermelho)
✅ **Marcas decorativas** no dial
✅ **Glow effect** no needle e cap (3 camadas de box-shadow)
✅ **Animação tunedPulse** quando afinado
✅ **Visualizador de frequência** (canvas, básico)
✅ **Header/Footer** responsivos
✅ **CSS Modules** para isolamento de estilos

---

## 🚀 Como Iniciar/Continuar

### Setup Inicial
```bash
cd C:\Users\kaell\Music\my-nextjs-app
npm install
npm run dev
```
Abre automaticamente em `http://localhost:5173/`

### Build para Produção
```bash
npm run build          # dist/ com arquivos otimizados
npm run serve          # preview em http://localhost:4173/
```

### Desenvolvimento
- **Editar componentes**: Vite hot-reloads automaticamente
- **Editar CSS**: CSS Modules aplica mudanças em tempo real
- **Debugar audio**: Abrir DevTools (F12), aba Console para logs

---

## 📝 Próximos Passos Sugeridos

### 1. Melhorar FrequencyVisualizer (Prioridade Alta)
**Arquivo**: `src/components/FrequencyVisualizer/FrequencyVisualizer.tsx`
- Atualmente desenha linhas do time-domain data
- **Sugestão**: Renderizar histograma de frequência com cores por intensidade
- **Implementação**: Usar `getByteFrequencyData()` em vez de `getTimeDomainData()`

### 2. Adicionar Seletor de Cordas (Prioridade Média)
**Novo arquivo**: `src/components/StringSelector/StringSelector.tsx`
- 6 botões: E1, A1, D2, G2, B2, E3 (guitarra)
- Highlight a corda ativa
- Salvar em localStorage

```typescript
interface StringConfig {
  name: string;
  frequency: number;
  note: string;
}
const strings: StringConfig[] = [
  { name: "E", frequency: 82.41, note: "E2" },
  { name: "A", frequency: 110.00, note: "A2" },
  { name: "D", frequency: 146.83, note: "D3" },
  { name: "G", frequency: 196.00, note: "G3" },
  { name: "B", frequency: 246.94, note: "B3" },
  { name: "E", frequency: 329.63, note: "E4" },
];
```

### 3. Modo Cromático vs Guitarra (Prioridade Média)
**Novo arquivo**: `src/components/ModeSelector/ModeSelector.tsx`
- Modo "Guitarra": destaca 6 notas (E A D G B)
- Modo "Cromático": todas as 12 notas
- Toggle via buttons ou dropdown

### 4. Customizar Frequência A4 (Prioridade Baixa)
**Arquivo**: `src/utils/musicUtils.ts`
- Adicionar parâmetro: `getNoteFromFrequency(freq, a4Frequency = 440)`
- UI: Input numérico ou presets (440, 432, 435, etc.)

### 5. Melhorar Visual do Canvas (Prioridade Baixa)
**Arquivo**: `src/components/FrequencyVisualizer/FrequencyVisualizer.tsx`
- Adicionar gradiente (verde → amarelo → vermelho)
- Suavizar valores com smoothing
- Escala logarítmica de frequências (mais detalhes em baixas)

---

## 🔧 Configurações Críticas

### Audio Constraints (`useMicrophone.ts`)
```typescript
{
  audio: {
    echoCancellation: true,      // Reduz feedback
    noiseSuppression: true,      // Remove ruído
    autoGainControl: false        // Mantém nível consistente
  }
}
```

### YIN Threshold (`pitchDetection.ts`)
- **0.10**: Muito sensível, muitos falsos positivos
- **0.12**: Recomendado (atual)
- **0.15**: Mais restritivo, evita ruído

### FFT Size (`useMicrophone.ts`)
- **2048**: Latência baixa, menos resolução (~21 Hz por bin)
- **4096**: Resolução alta, latência média (~10 Hz por bin) ← ATUAL
- **8192**: Máxima resolução, latência alta (~5 Hz por bin)

---

## 📊 Testes & Validação

### Testar Detecção de Pitch
1. Abrir app em navegador
2. Clicar "Start" (conceder permissão de microfone)
3. Assobiar ou tocar nota (ex: A4 = 440 Hz)
4. Verificar: nota, frequência e cents displays

**Comportamento esperado**:
- Nota deve ser correta (ex: A#1 para 59.94 Hz)
- Frequência deve ser próxima (±5 Hz de variação normal)
- Cents dentro de ±50 do semitom mais próximo

### Testar Animação tunedPulse
1. Tocar nota e ajustar até estar bem afinada (\|cents\| ≤ 5)
2. Observar cap do centro pulsando com glow verde
3. Afastar do pitch → animação para

### Debugar Audio Data
```javascript
// No console (F12):
// Para ver RMS em tempo real:
// Adicionar log em Tuner.tsx antes de detectPitch
console.log('RMS:', rms, 'Frequency:', f);
```

---

## 🐛 Troubleshooting

| Problema | Causa | Solução |
|----------|-------|---------|
| Microfone não funciona | NotAllowedError | Verificar permissão em browser settings |
| Nota não detecta | Silêncio ou ruído | Aumentar volume, assobiar mais alto |
| Needle não se move | Pitch não detectado | Verificar YIN threshold, tentar outra nota |
| Animação muito rápida | Duração curta | Ajustar `1.2s` em `@keyframes tunedPulse` |
| Canvas branco | FrequencyVisualizer não ativo | Dados podem estar zerados, verificar RMS |

---

## 📚 Referências Técnicas

### Web Audio API
- **AnalyserNode**: FFT analysis, frequency/time domain data
- **MediaStreamAudioSourceNode**: Entrada do microfone
- **getFloatFrequencyData()**: Dados em dB (usado em visualizadores)
- **getByteFrequencyData()**: Dados em 0-255 (mais eficiente)
- **getFloatTimeDomainData()**: Waveform para pitch detection

### Padrões React
- **useMicrophone**: Custom hook com cleanup em useEffect
- **refs para dados**: Previne re-renders desnecessários de arrays
- **requestAnimationFrame**: Loop de animação sincronizado com tela

### Formulas Musicais
```
Semitom acima = freq * 2^(1/12)
Semitom abaixo = freq / 2^(1/12)
Octava acima = freq * 2
Cents offset = 1200 * log2(freq_atual / freq_esperada)
```

---

## 💾 Variáveis de Ambiente

Nenhuma necessária no momento. Todas as configurações são hardcoded em constantes:
- `TARGET_FPS = 30` (Tuner.tsx)
- `YIN_THRESHOLD = 0.12` (pitchDetection.ts)
- `MIN_FREQUENCY = 50` (pitchDetection.ts)
- `MAX_FREQUENCY = 1200` (pitchDetection.ts)

Se precisar externalizá-las, criar `.env` e usar `import.meta.env`.

---

## 👤 Contato & Contexto

**Última atualização**: 26 Nov 2025
**Desenvolvido com**: GitHub Copilot + Claude Haiku
**Próximo revisor sugerido**: Gemini (conforme orientação do usuário)

**Para continuar**: Leia este arquivo + `copilot-instructions.md` antes de fazer mudanças.
