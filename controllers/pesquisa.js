const Item = require("../models/Item");

// Função para pesquisar itens
const pesquisarItens = async (req, res) => {
  try {
    // Extrai os dados do formulário
    const { nome, localizacao, categoria } = req.body;

    console.log(req.body);

    // Construção da query dinâmica com base nos filtros fornecidos
    const query = {};
    if (nome) query.nome = new RegExp(nome, "i"); // Pesquisa parcial e case-insensitive
    if (localizacao) query.localizacao = localizacao;
    if (categoria) query.categoria = categoria;

    // Consulta ao MongoDB
    const resultados = await Item.find(query);
    console.log(resultados);
    // Se não houver resultados
    if (resultados.length === 0) {
      return res.render("resultadosPesquisa", {
        error: "Ocorreu um erro ao realizar a pesquisa. Tente novamente.",
      });
    }

    // Renderiza a página com os resultados encontrados
    return res.render("resultadosPesquisa", { resultados });
  } catch (error) {
    console.error("Erro ao realizar a pesquisa:", error);
    return res.render("resultadosPesquisa", {
      error: "Ocorreu um erro ao realizar a pesquisa. Tente novamente.",
    });
  }
};

module.exports = {
  pesquisarItens,
};
