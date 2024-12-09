const Item = require("../models/Item");

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

    // Renderiza a página com os resultados encontrados
    return res.render("resultadosPesquisa", { resultados, error: null });
  } catch (error) {
    console.error("Erro ao realizar a pesquisa:", error);
    return res.render("resultadosPesquisa", {
      resultados: [],
      error: "Ocorreu um erro ao realizar a pesquisa. Tente novamente.",
    });
  }
};

module.exports = {
  pesquisarItens,
};
