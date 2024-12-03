const crypto = require("crypto");

const enviarInformacaoTransacao = async (req, res) => {
  try {
    // Retorna as chaves geradas
    res.json({
      idUtilizador: req.cookies,
    });
  } catch (error) {
    console.error("Error ao buscar id do utilizador:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  buscarIdUtilizador,
};
