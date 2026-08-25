# Protótipo de Camera (JoviHub)

Esse é apenas um protótipo e não representa a versão final do produto.

---

## Link do Repositorio:

https://github.com/JoviHub-Challenge-2026/prototype-zen-camera

## Integrantes:

| Aluno               | RM.    |
| ------------------- | ------ |
| **Raul Azzi Corsi** | 569022 |
| **Gustavo Rezende** | 570708 |
| **João Maschion**   | 570509 |
| **João Lagonegro**  | 569444 |
| **Lucas Alves**     | 572216 |

## AI Disclaimer:

Bom dia professor, Raul Azzi Corsi aqui, do rm569022, gostaria de mencionar e esclarecer do uso de ia nesse projeto, e foram para duas coisas e de duas meneiras diferentes.

1 - Criei esse prototipo bem rapidamente como forma de estudo - além é claro, como requisito para a sua sprint - de um curso que estou fazendo a parte sobre REACT (https://www.udemy.com/course/react-the-complete-guide-incl-redux/), dito isso qualquer duvida que eu tive durante a produção deste entregavél eu usei o Claude como ajua - ou muleta - o link para as instruções que meu Claude segue estao no meu GitHub: https://github.com/raulacor/Configs/blob/main/Claude.ai/The%20Academic%20&%20Utility%20Hybrid%20Prompt.txt

2 - A maior parte deste README foi feito por ia, por que eu simplemente não tenho a paciencia que os READMEs da vida requerem.

---

## Stack

| Ferramenta | Para que serve                                                              |
| ---------- | --------------------------------------------------------------------------- |
| **React**  | Monta a tela em pedacos reutilizaveis chamados componentes                  |
| **Vite**   | Servidor de desenvolvimento e ferramenta de build. E ele que roda o projeto |

---

## Pre-requisitos

Voce precisa do **Node.js** instalado na maquina. Para conferir se ja tem, abra o
terminal e rode:

```bash
node -v
```

Se aparecer um numero de versao (ex: `v22.11.0`), esta tudo certo. Se der erro de
"comando nao encontrado", baixe e instale o Node em https://nodejs.org

---

## Como instalar as dependencias

Entre na pasta do projeto e rode o `npm install`:

```bash
cd camera
npm install
```

Esse comando le a lista de bibliotecas do arquivo `package.json` e baixa todas elas
para dentro de uma pasta nova chamada `node_modules/`.

> Voce so precisa fazer isso **uma vez**. Depois de instalado, pule direto para o
> proximo passo.

---

## Como rodar o projeto

```bash
npm run dev
```

O terminal vai mostrar um endereco parecido com este:

```
  ➜  Local:   http://localhost:5173/
```

Abra esse endereco no navegador. Pronto.

Enquanto o servidor estiver rodando, qualquer alteracao que voce salvar nos
arquivos aparece na tela **na hora**, sem precisar recarregar a pagina.

Para parar o servidor, aperte `Ctrl + C` no terminal.

### Outros comandos

| Comando           | O que faz                                          |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Roda o projeto no modo de desenvolvimento          |
| `npm run build`   | Gera a versao final e otimizada na pasta `dist/`   |
| `npm run preview` | Abre a versao gerada pelo `build` para voce testar |

---

## Estrutura dos arquivos

```
camera/
├── index.html              Pagina base. Tem so uma div vazia onde o React entra
├── package.json            Lista de dependencias e dos comandos (dev, build...)
├── vite.config.js          Configuracao do Vite
└── src/
    ├── main.jsx            Ponto de entrada. Liga o React na div do index.html
    ├── App.jsx             A tela inteira: header + visor + footer
    ├── styles.css          Todo o CSS do projeto
    └── components/
        └── Header.jsx      O componente do header
```

---

## O que funciona e o que nao funciona

**Funciona:**

- O layout inteiro esta montado e responde a `hover` e ao clique (efeito visual).
- O header ja esta separado em um componente proprio.

**Nao funciona (ainda):**

- O botao **AI** nao faz nada.
- O botao **AI Archive** nao faz nada. Um dia ele vai levar para o arquivo da AI.
- O botao da **galeria** nao faz nada. Um dia ele vai levar para a galeria.
- O **obturador** nao tira foto.
- O **visor nao e a camera de verdade** — e so um retangulo preto com um icone.
