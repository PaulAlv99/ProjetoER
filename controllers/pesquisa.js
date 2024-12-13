const Item = require("../models/Item");

// Definir as localidades e categorias fora da função
const localidades = {
  vianadocastelo: "Viana do Castelo",
  porto: "Porto",
  braga: "Braga",
  lisboa: "Lisboa",
  coimbra: "Coimbra",
  faro: "Faro",
  aveiro: "Aveiro",
  leiria: "Leiria",
  guarda: "Guarda",
  evora: "Évora",
  setubal: "Setúbal",
  vila_real: "Vila Real",
  viseu: "Viseu",
  castelo_branco: "Castelo Branco",
  braganca: "Bragança",
  santarem: "Santarém",
  beja: "Beja",
  portalegre: "Portalegre",
  madeira: "Madeira",
  acores: "Açores",
};

const categorias = {
  jardinagem: "Jardinagem",
  tecnologia: "Tecnologia",
  construcao: "Construção",
  automoveis: "Automóveis",
  educacao: "Educação",
  saude: "Saúde",
  moda: "Moda",
  beleza: "Beleza",
  alimentacao: "Alimentação",
  turismo: "Turismo",
  desporto: "Desporto",
  cultura: "Cultura",
  musica: "Música",
  arte: "Arte",
  imoveis: "Imóveis",
  empregos: "Empregos",
  servicos: "Serviços",
  informatica: "Informática",
  livros: "Livros",
  animais: "Animais",
};

// Função para pesquisar itens
const pesquisarItens = async (req, res) => {
  try {
    // Extrai os dados do formulário
    console.log(req.body);
    const { nome, localizacao, categoria } = req.body;

    // Construção da query dinâmica com base nos filtros fornecidos
    const query = {};
    if (nome) query.nome = new RegExp(nome, "i"); // Pesquisa parcial e case-insensitive
    if (localizacao) query.localizacao = localizacao;
    if (categoria) query.categoria = categoria;

    // Consulta ao MongoDB
    const resultados = await Item.find(query);
    console.log(resultados);

    // Verifica e formata os dados de nome, localizacao e categoria
    const nomeFormatado = nome === "" ? null : nome;
    const localizacaoFormatada = localizacao ? localidades[localizacao] : null;
    const categoriaFormatada = categoria ? categorias[categoria] : null;

    // Renderiza a página com os resultados encontrados
    return res.render("resultadosPesquisa", {
      resultados,
      nome: nomeFormatado,
      localizacao: localizacaoFormatada,
      categoria: categoriaFormatada,
      error: null,
    });
  } catch (error) {
    console.error("Erro ao realizar a pesquisa:", error);
    return res.render("resultadosPesquisa", {
      resultados: [],
      nome: null,
      localizacao: null,
      categoria: null,
      error: "Ocorreu um erro ao realizar a pesquisa. Tente novamente.",
    });
  }
};

module.exports = {
  pesquisarItens,
};
