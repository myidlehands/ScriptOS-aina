
<img src="/aina_header.png" align="left" width="350" alt="A.I.N.A. Header" style="margin-right: 25px; margin-bottom: 20px; border-radius: 12px;">

# ScriptOS-aina `v3.0.0`

### O Sistema Operacional Definitivo para Criadores

Gerencie tendências, decodifique estilos e gere roteiros virais com a inteligência da **A.I.N.A.**, recursos avançados para descoberta de roteiros e auxílio personalizado.



[![Issues](https://img.shields.io/github/issues/myidlehands/scriptos-aina?style=flat-square&logo=github&color=FF0000)](https://github.com/myidlehands/scriptos-aina/issues)
[![Forks](https://img.shields.io/github/forks/myidlehands/scriptos-aina?style=flat-square&logo=github&color=00c6ff)](https://github.com/myidlehands/scriptos-aina/network/members)
[![Stars](https://img.shields.io/github/stars/myidlehands/scriptos-aina?style=flat-square&logo=github&color=EAC54F)](https://github.com/myidlehands/scriptos-aina/stargazers)
[![License](https://img.shields.io/github/license/myidlehands/scriptos-aina?style=flat-square&color=888888)](./LICENSE)

---
---
  <br>
  <summary><h2 style="display: inline-block">📋 Tabela de Conteúdos</h2></summary>
  <ol>
    <li><a href="#-o-que-há-de-novo-na-v300">O Que Há de Novo (v3.0.0)</a></li>
    <li><a href="#-conheça-a-aina">Conheça a A.I.N.A.</a></li>
    <li><a href="#-funcionalidades-chave">Funcionalidades Chave</a></li>
    <li><a href="#-tecnologias-utilizadas">Tecnologias Utilizadas</a></li>
    <li><a href="#-começando">Começando</a></li>
    <li><a href="#-configuração-de-ambiente">Configuração de Ambiente</a></li>
  </ol>
  <br>

---
---

## 🆕 O Que Há de Novo na v3.0.0?

Esta atualização marca uma revisão completa da arquitetura do projeto, focada em performance, tipagem estrita e uma nova identidade de IA.

* **⚡ Migração para Vite:** Adeus tempos de carregamento lentos. O ambiente de desenvolvimento agora é instantâneo.
* **🟦 TypeScript Estrito:** Base de código portada para TypeScript para maior robustez e menos bugs em tempo de execução.
* **🎨 Tailwind CSS:** Interface visual totalmente reformulada com Tailwind para um design moderno, responsivo e limpo.
* **🤖 Nova Persona - A.I.N.A.:** O antigo assistente "The Archivist" foi aposentado. A **A.I.N.A.** assume com uma personalidade mais proativa e analítica para geração de conteúdo.
* **🔒 Segurança Reforçada:** Refatoração completa no manuseio de variáveis de ambiente e chaves de API.

---

## 🤖 Conheça a A.I.N.A.

**A.I.N.A.** (Artificial Intelligence Narrative Assistant) é o cérebro por trás do ScriptOS. Diferente de geradores de texto comuns, ela está conectada diretamente ao pulso do YouTube.

Ela não apenas "escreve"; ela:
1.  **Analisa** dados brutos da YouTube Data API.
2.  **Cruza** informações com tendências atuais.
3.  **Estrutura** roteiros baseados em psicologia de retenção.

> *"Eu não crio apenas conteúdo. Eu projeto narrativas otimizadas para o algoritmo." — A.I.N.A.*

---

## ✨ Funcionalidades Chave

### 🎯 Caçador de Tendências (Trend Hunter)
Identifique tópicos em ascensão no seu nicho antes que eles saturem, com dados diretos da YouTube Data API.

<div align="center">
  http://googleusercontent.com/image_generation_content/1


</div>

### 📜 Geração de Roteiros com A.I.N.A.
Insira seu tópico e deixe a A.I.N.A. gerar um roteiro completo, estruturado e otimizado para retenção, com sugestões visuais.

<div align="center">
  http://googleusercontent.com/image_generation_content/2


</div>

---

## 🛠 Tecnologias Utilizadas

A stack foi modernizada para garantir escalabilidade e velocidade.

<div align="center">
  http://googleusercontent.com/image_generation_content/3


</div>

* **Vite:** Build tool ultrarrápida para desenvolvimento frontend.
* **React:** Biblioteca JavaScript para construção de interfaces de usuário.
* **TypeScript:** Superset tipado de JavaScript para código mais robusto.
* **Tailwind CSS:** Framework CSS utilitário para design rápido e responsivo.
* **Google AI (Gemini):** Modelos de IA avançados para geração de conteúdo.

---

## 🚀 Começando

Siga os passos abaixo para configurar seu ambiente de desenvolvimento local com a nova arquitetura Vite.

### Pré-requisitos
* Node.js (v18+ recomendado)
* Gerenciador de pacotes (npm ou yarn)

### Instalação

1.  **Clone o repositório**
    ```bash
    git clone [https://github.com/myidlehands/scriptos-aina.git](https://github.com/myidlehands/scriptos-aina.git)
    cd scriptos-aina
    ```

2.  **Instale as dependências**
    ```bash
    npm install
    ```

3.  **Verifique o Linting (Novo na v3.0)**
    Garanta que o código está seguindo os padrões do projeto:
    ```bash
    npm run lint
    ```

4.  **Inicie o Servidor de Desenvolvimento**
    ```bash
    npm run dev
    ```

---

## 🔐 Configuração de Ambiente

**IMPORTANTE:** A versão 3.0.0 altera como as chaves de API são processadas para maior segurança.

1.  Renomeie o arquivo `.env.example` para `.env` na raiz do projeto.
2.  Preencha as variáveis. Note que projetos Vite exigem o prefixo `VITE_` para expor variáveis ao cliente.

```env
# Exemplo de configuração .env

# Chave da Google AI Studio (Para a inteligência da A.I.N.A.)
VITE_GOOGLE_AI_KEY=sua_chave_aqui

# Chave da YouTube Data API v3 (Para busca de tendências)
VITE_YOUTUBE_API_KEY=sua_chave_aqui
```

## 🗺️ Roadmap e Funcionalidades
[x] Trend Hunter: Busca de tópicos quentes via API.

[x] Style Decoder: Engenharia reversa de vídeos virais.

[x] A.I.N.A. Persona: Integração completa do novo sistema de prompts.

[x] UI/UX 3.0: Redesign completo com Tailwind.

[ ] Modo "Dark Web": Análise profunda de nichos underground (Em Breve).

[ ] Exportação Direta: Integração com Notion/Docs (Em Breve).


📝 Licença
Distribuído sob a licença MIT. Veja LICENSE para mais informações.

<div align="center"> <img src="https://www.google.com/search?q=https://capsule-render.vercel.app/api%3Ftype%3Drect%26color%3D00c6ff%26height%3D100%26section%3Dfooter%26text%3DScriptOS-aina%2520v3.0.0%26fontSize%3D20%26fontColor%3Dffffff%26desc%3DDeveloped%2520with%2520%25E2%259D%25A4%25EF%25B8%258F%2520by%2520myidlehands%26descAlignY%3D70%26descFontSize%3D15" width="100%" alt="Footer Banner"> </div>
