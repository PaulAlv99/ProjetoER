const crypto = require("crypto");

const Utilizador = require("../models/Utilizador");
const Item = require("../models/Item");

const informacaoTransacaoUtilizador = async (req, res) => {
  try {
    const idUtilizador = req.cookies;

    // Busca o utilizador e indica os itens associados
    const itens = await Item.find({ idUtilizador: idUtilizador });
    const utilizador = await Utilizador.find({ publicKey: idUtilizador });
    res.json({
      idperfilUtilizador: utilizador,
      itensUtilizador: itens,
    });
  } catch (error) {
    console.error("Error ao buscar utilizador com itens:", error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  informacaoTransacaoUtilizador,
};
