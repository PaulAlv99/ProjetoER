// generateKeys.js
const crypto = require('crypto');

const gerarChaves = () => {
  try {

    // Gerar par de chaves RSA
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return {
      privateKey,
      publicKey,
      message: `Chaves criadas com sucesso!`,
    };
  } catch (error) {
    throw new Error(`Erro criar chaves: ${error.message}`);
  }
};

// Handler for HTTP requests
const gerarChavesHandler = async (req, res) => {
  try {
    const result = gerarChaves();

    // Retorna as chaves geradas
    res.json({
      privateKey: result.privateKey,
      publicKey: result.publicKey
    });
  } catch (error) {
    console.error('Error ao criar chaves:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  gerarChaves,
  gerarChavesHandler
};