const User = require('../models/Utilizador');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const crypto = require('crypto');

const secretKey = "PereiroRecicla"; // Use the same secret key everywhere

const upload = multer();

// Authentication middleware
const autenticarToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.redirect('/login');
    }
    req.user = user;
    next();
  });
};

// Login controller
const login = async (req, res) => {
  try {
    upload.fields([
      { name: 'privateKey', maxCount: 1 }
    ])(req, res, async (err) => {
      if (err) {
        return res.render('loginForm', { error: err.message });
      }

      try {
        const { pseudonimo } = req.body;

        // Find user
        const user = await User.findOne({ pseudonimo });
        if (!user) {
          return res.render('loginForm', { error: 'Credenciais inválidas' });
        }

        if (!req.files || !req.files.privateKey) {
          return res.render('loginForm', { error: 'Por favor, faça upload da chave privada' });
        }

        try {
          const publicKey = user.publicKey;
          const privateKey = req.files.privateKey[0].buffer.toString('utf8');

          // Test key pair by signing and verifying
          const testData = 'test';
          const sign = crypto.createSign('SHA256');
          sign.update(testData);
          const signature = sign.sign(privateKey);

          const verify = crypto.createVerify('SHA256');
          verify.update(testData);
          const isValid = verify.verify(publicKey, signature);

          if (!isValid) {
            return res.render('loginForm', { error: 'Chave privada inválida' });
          }

          // Generate JWT token
          const token = jwt.sign(
            { userId: user._id },
            secretKey,  // Use the same secret key
            { expiresIn: '24h' }
          );

          // Set token in cookie
          res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Enable for HTTPS
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
          });

          return res.redirect('/');
        } catch (error) {
          console.error('Erro na verificação da chave:', error);
          return res.render('loginForm', { error: 'Erro na verificação da chave' });
        }
      } catch (error) {
        console.error('Erro de login:', error);
        return res.render('loginForm', { error: 'Login falhou. Tente novamente' });
      }
    });
  } catch (error) {
    console.error('Erro de login:', error);
    return res.render('loginForm', { error: 'Login falhou. Tente novamente' });
  }
};

// Registration stays the same but add return statements
const registo = async (req, res) => {
  try {
    upload.fields([
      { name: 'idDocument', maxCount: 1 },
      { name: 'publicKey', maxCount: 1 }
    ])(req, res, async (err) => {
      if (err) {
        return res.render('registoForm', { error: err.message });
      }

      try {
        const { pseudonimo, age } = req.body;

        if (!req.files || !req.files.idDocument || !req.files.publicKey) {
          return res.render('registoForm', { error: 'Por favor faça upload de ambos os ficheiros' });
        }

        const publicKeyContent = req.files.publicKey[0].buffer.toString('utf8');
        const idImageBuffer = req.files.idDocument[0].buffer;
        const idImageHash = crypto.createHash('sha256').update(idImageBuffer).digest('hex');

        const existingUser = await User.findOne({ pseudonimo });
        if (existingUser) {
          return res.render('registoForm', { error: 'Pseudónimo já existe, tente outro' });
        }

        const existingKey = await User.findOne({ publicKey: publicKeyContent });
        if (existingKey) {
          return res.render('registoForm', { error: 'Esta chave pública já está registada' });
        }

        const existingId = await User.findOne({ 'idDocument.hash': idImageHash });
        if (existingId) {
          return res.render('registoForm', { error: 'O documento de identificação já foi registado' });
        }

        if (parseInt(age) < 18) {
          return res.render('registoForm', { error: 'Tem de ter pelo menos 18 anos' });
        }

        const user = new User({
          pseudonimo,
          age,
          idDocument: {
            data: idImageBuffer,
            contentType: req.files.idDocument[0].mimetype,
            hash: idImageHash
          },
          publicKey: publicKeyContent
        });

        await user.save();
        return res.redirect('/login');
      } catch (error) {
        console.error('Erro de registo:', error);
        return res.render('registoForm', { error: 'Registo falhou. Tente novamente' });
      }
    });
  } catch (error) {
    console.error('Erro de registo:', error);
    return res.render('registoForm', { error: 'Registo falhou. Tente novamente' });
  }
};

const sair = (req, res) => {
  res.clearCookie('token');
  return res.redirect('/login');
};

module.exports = {
  registo,
  login,
  sair,
  autenticarToken
};