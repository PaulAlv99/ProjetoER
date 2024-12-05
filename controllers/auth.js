const User = require("../models/Utilizador");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const crypto = require("crypto");
const Entidade = require("../models/Entidade");
const Localidade = require("../models/Localidade");
const secretKey = "PereiroRecicla"; // Use the same secret key everywhere

const upload = multer();

// Authentication middleware
const autenticarTokenUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login");
  }

  jwt.verify(token, secretKey, async (err, user) => {
    console.log(user);
    const { userId, iat, exp } = user;
    const procurarUser = await User.findById(userId);
    if (err) {
      return res.redirect("/login");
    }
    if (!procurarUser) {
      return res.redirect("/login");
    }
    next();
  });
};

const autenticarTokenEntidade = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login-entidade");
  }

  jwt.verify(token, secretKey, async (err, entidade) => {
    console.log(entidade);
    const { entidadeId, iat, exp } = entidade;
    const procurarEntidade = await Entidade.findById(entidadeId);
    // console.log(procurarEntidade);
    if (err) {
      return res.redirect("/login-entidade");
    }
    if (!procurarEntidade) {
      return res.redirect("/login-entidade");
    }
    if (procurarEntidade.estado !== "aprovado") {
      return res.redirect("/login-entidade");
    }
    next();
  });
};

const autenticarTokenLocalidade = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login-localidade");
  }

  jwt.verify(token, secretKey, async (err, localidade) => {
    console.log("Localidade:", localidade);
    const { localidadeId, localidadeTipo, iat, exp } = localidade;
    //tipo a dar undefined
    // console.log("Localidade ID:", localidadeId);
    // console.log("Localidade Tipo:", localidadeTipo);
    // console.log("iat:", iat);
    // console.log("exp:", exp);
    const procurarLocalidade = await Localidade.findById(localidadeId);
    console.log(procurarLocalidade);
    // console.log("Localidade encontrada:", procurarLocalidade);
    if (err) {
      return res.redirect("/login-localidade");
    }
    if (!procurarLocalidade) {
      return res.redirect("/login-localidade");
    }
    if (procurarLocalidade.estado !== "aprovado") {
      return res.redirect("/login-localidade");
    }
    next();
  });
};

const loginUser = async (req, res) => {
  try {
    upload.fields([{ name: "privateKey", maxCount: 1 }])(
      req,
      res,
      async (err) => {
        if (err) {
          return res.render("loginForm", { error: err.message });
        }

        try {
          console.log(req.body);
          const { pseudonimo } = req.body;

          // Find user
          const user = await User.findOne({ pseudonimo });
          if (!user) {
            return res.render("loginForm", { error: "Credenciais inválidas" });
          }

          if (!req.files || !req.files.privateKey) {
            return res.render("loginForm", {
              error: "Por favor, faça upload da chave privada",
            });
          }

          try {
            const publicKey = user.publicKey;
            const privateKey = req.files.privateKey[0].buffer.toString("utf8");

            // Test key pair by signing and verifying
            const testData = "test";
            const sign = crypto.createSign("SHA256");
            sign.update(testData);
            const signature = sign.sign(privateKey);

            const verify = crypto.createVerify("SHA256");
            verify.update(testData);
            const isValid = verify.verify(publicKey, signature);

            if (!isValid) {
              return res.render("loginForm", {
                error: "Chave privada inválida",
              });
            }

            // Generate JWT token
            const token = jwt.sign({ userId: user._id }, secretKey, {
              expiresIn: "24h",
            });

            // Set token in cookie
            res.cookie("token", token, {
              httpOnly: true,
              secure: true, // Enable for HTTPS
              maxAge: 24 * 60 * 60 * 1000, // 24 hours
            });

            return res.redirect("/");
          } catch (error) {
            console.error("Erro na verificação da chave:", error);
            return res.render("loginForm", {
              error: "Erro na verificação da chave",
            });
          }
        } catch (error) {
          console.error("Erro de login:", error);
          return res.render("loginForm", {
            error: "Login falhou. Tente novamente",
          });
        }
      }
    );
  } catch (error) {
    console.error("Erro de login:", error);
    return res.render("loginForm", { error: "Login falhou. Tente novamente" });
  }
};

const registoUser = async (req, res) => {
  try {
    upload.fields([
      { name: "docIdentificacao", maxCount: 1 },
      { name: "publicKey", maxCount: 1 },
    ])(req, res, async (err) => {
      if (err) {
        return res.render("registoForm", { error: err.message });
      }

      try {
        console.log(req.body);
        const { pseudonimo, age } = req.body;

        if (!req.files || !req.files.docIdentificacao || !req.files.publicKey) {
          return res.render("registoForm", {
            error: "Por favor faça upload de ambos os ficheiros",
          });
        }

        const publicKeyContent = req.files.publicKey[0].buffer.toString("utf8");
        const idImageBuffer = req.files.docIdentificacao[0].buffer;
        const idImageHash = crypto
          .createHash("sha256")
          .update(idImageBuffer)
          .digest("hex");

        const existingUser = await User.findOne({ pseudonimo });
        if (existingUser) {
          return res.render("registoForm", {
            error: "Pseudónimo já existe, tente outro",
          });
        }

        const existingKey = await User.findOne({ publicKey: publicKeyContent });
        if (existingKey) {
          return res.render("registoForm", {
            error: "Esta chave pública já está registada",
          });
        }

        const existingId = await User.findOne({
          "docIdentificacao.hash": idImageHash,
        });
        if (existingId) {
          return res.render("registoForm", {
            error: "O documento de identificação já foi registado",
          });
        }

        if (parseInt(age) < 18) {
          return res.render("registoForm", {
            error: "Tem de ter pelo menos 18 anos",
          });
        }

        const user = new User({
          pseudonimo,
          age,
          docIdentificacao: {
            data: idImageBuffer,
            contentType: req.files.docIdentificacao[0].mimetype,
            hash: idImageHash,
          },
          publicKey: publicKeyContent,
        });

        await user.save();
        return res.redirect("/login");
      } catch (error) {
        console.error("Erro de registo:", error);
        return res.render("registoForm", {
          error: "Registo falhou. Tente novamente",
        });
      }
    });
  } catch (error) {
    console.error("Erro de registo:", error);
    return res.render("registoForm", {
      error: "Registo falhou. Tente novamente",
    });
  }
};

const sair = (req, res) => {
  res.clearCookie("token");
  return res.redirect("/login");
};

const loginEntidade = async (req, res) => {
  try {
    console.log(req.body);
    // Match form field name from frontend
    const { nomeEntidade, password } = req.body;

    // Input validation
    if (!nomeEntidade || !password) {
      return res.render("loginEntidade", {
        error: "Por favor preencha todos os campos",
      });
    }
    const entidade = await Entidade.findOne({ nome: nomeEntidade });
    console.log(entidade);
    if (!entidade) {
      return res.render("loginEntidade", {
        error: "Credenciais inválidas",
      });
    }

    // Hash the provided password
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Compare hashed passwords
    if (entidade.password !== hashedPassword) {
      return res.render("loginEntidade", {
        error: "Credenciais inválidas",
      });
    }

    // Check entity status
    if (entidade.estado === "pendente") {
      return res.render("loginEntidade", {
        error: "Conta aguarda aprovação administrativa",
      });
    } else if (entidade.estado === "rejeitado") {
      return res.render("loginEntidade", {
        error: "Pedido de registo foi rejeitado",
      });
    } else if (entidade.estado === "banido") {
      return res.render("loginEntidade", {
        error: "Esta entidade foi banida do sistema",
      });
    }
    try {
      if (entidade.estado === "aprovado") {
        console.log("Entidade aprovada");
        const token = jwt.sign({ entidadeId: entidade._id }, secretKey, {
          expiresIn: "24h",
        });

        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
        console.log("Token set");
        return res.redirect("/entidade/dashboard");
      }
    } catch (e) {
      console.log(e);
      return res.render("loginEntidade", {
        error: "Erro na criação do token",
      });
    }
  } catch (error) {
    console.error("Erro de login da entidade:", error);
    return res.render("loginEntidade", {
      error: "Login falhou. Tente novamente",
    });
  }
};

const registoEntidade = async (req, res) => {
  try {
    upload.fields([{ name: "idIdentidade", maxCount: 1 }])(
      req,
      res,
      async (err) => {
        if (err) {
          return res.render("registoEntidade", { error: err.message });
        }

        try {
          const { nome, especializacao, descricao, password } = req.body;

          if (!nome || !especializacao || !descricao || !password) {
            return res.render("registoEntidade", {
              error: "Por favor preencha todos os campos obrigatórios",
            });
          }

          if (!req.files || !req.files.idIdentidade) {
            return res.render("registoEntidade", {
              error: "Por favor faça upload do documento de identidade",
            });
          }

          // Validate file type
          const allowedMimeTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
          ];
          const docIdentidade = req.files.idIdentidade[0];

          if (!allowedMimeTypes.includes(docIdentidade.mimetype)) {
            return res.render("registoEntidade", {
              error: "Tipo de ficheiro não suportado. Use PDF, JPEG ou PNG",
            });
          }

          const existingEntidade = await Entidade.findOne({ nome });
          if (existingEntidade) {
            return res.render("registoEntidade", {
              error: "Nome já existe, tente outro",
            });
          }

          // Hash password
          const hashedPassword = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

          const entidade = new Entidade({
            nome,
            especializacao,
            descricao,
            password: hashedPassword,
            docIdentidade: {
              data: docIdentidade.buffer,
              contentType: docIdentidade.mimetype,
            },
            estado: "pendente",
          });

          await entidade.save();
          console.log(req.body);
          // Redirect with success message
          return res.render("loginLocalidade", {
            success:
              "Registo efetuado com sucesso! Aguarde aprovação administrativa.",
          });
        } catch (error) {
          console.error("Erro de registo da entidade:", error);
          return res.render("registoEntidade", {
            error: "Registo falhou. Tente novamente",
          });
        }
      }
    );
  } catch (error) {
    console.error("Erro de registo da entidade:", error);
    return res.render("registoEntidade", {
      error: "Registo falhou. Tente novamente",
    });
  }
};
const registoLocalidade = async (req, res) => {
  try {
    upload.fields([{ name: "idIdentidade", maxCount: 1 }])(
      req,
      res,
      async (err) => {
        console.log(req.body);
        if (err) {
          return res.render("registoLocalidade", { error: err.message });
        }

        try {
          const { nome, localizacao, descricao, password } = req.body;

          // Validate required fields
          if (!nome || !localizacao || !descricao || !password) {
            return res.render("registoLocalidade", {
              error: "Por favor preencha todos os campos obrigatórios",
            });
          }

          // Check file upload
          if (!req.files || !req.files.idIdentidade) {
            return res.render("registoLocalidade", {
              error: "Por favor faça upload do documento de identidade",
            });
          }

          // Validate file type
          const allowedMimeTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
          ];
          const docIdentidade = req.files.idIdentidade[0];

          if (!allowedMimeTypes.includes(docIdentidade.mimetype)) {
            return res.render("registoLocalidade", {
              error: "Tipo de ficheiro não suportado. Use PDF, JPEG ou PNG",
            });
          }

          // Check if location name already exists
          const existingLocalidade = await Localidade.findOne({ nome });
          if (existingLocalidade) {
            return res.render("registoLocalidade", {
              error: "Nome já existe, tente outro",
            });
          }

          // Hash password
          const hashedPassword = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

          // Create new location
          const localidade = new Localidade({
            nome,
            localizacao,
            descricao,
            password: hashedPassword,
            docIdentidade: {
              data: docIdentidade.buffer,
              contentType: docIdentidade.mimetype,
            },
            estado: "pendente",
          });

          await localidade.save();
          console.log("Localidade saved:", localidade.nome);

          // Redirect with success message
          return res.render("loginLocalidade", {
            success:
              "Registo efetuado com sucesso! Aguarde aprovação administrativa.",
          });
        } catch (error) {
          console.error("Erro de registo da localidade:", error);
          return res.render("registoLocalidade", {
            error: "Registo falhou. Tente novamente",
          });
        }
      }
    );
  } catch (error) {
    console.error("Erro de registo da localidade:", error);
    return res.render("registoLocalidade", {
      error: "Registo falhou. Tente novamente",
    });
  }
};

const loginLocalidade = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { nomeLocalidade, password } = req.body;

    // Input validation
    if (!nomeLocalidade || !password) {
      return res.render("loginLocalidade", {
        error: "Por favor preencha todos os campos",
      });
    }

    // Find location by name
    const localidade = await Localidade.findOne({ nome: nomeLocalidade });

    if (!localidade) {
      return res.render("loginLocalidade", {
        error: "Credenciais inválidas",
      });
    }

    // Hash the provided password for comparison
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Compare hashed passwords
    if (localidade.password !== hashedPassword) {
      console.log("Password mismatch");
      return res.render("loginLocalidade", {
        error: "Credenciais inválidas",
      });
    }

    // Check location status
    if (localidade.estado === "pendente") {
      return res.render("loginLocalidade", {
        error: "Conta aguarda aprovação administrativa",
      });
    } else if (localidade.estado === "rejeitado") {
      return res.render("loginLocalidade", {
        error: "Pedido de registo foi rejeitado",
      });
    } else if (localidade.estado === "banido") {
      return res.render("loginLocalidade", {
        error: "Esta localidade foi banida do sistema",
      });
    } else if (localidade.estado === "suspenso") {
      return res.render("loginLocalidade", {
        error: "Esta conta está temporariamente suspensa",
      });
    }
    try {
      if (localidade.estado === "aprovado") {
        console.log("Localidade aprovada");
        // Generate JWT token
        const token = jwt.sign(
          {
            localidadeId: localidade._id,
            type: "localidade",
          },
          secretKey,
          { expiresIn: "24h" }
        );

        // Set cookie
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
      }
      console.log("Token set");
      return res.redirect("/localidade/dashboard");
    } catch (e) {
      console.error("Erro na criação do token:", e);
      return res.render("loginLocalidade", {
        error: "Erro na criação do token",
      });
    }
  } catch (error) {
    console.error("Erro de login da localidade:", error);
    return res.render("loginLocalidade", {
      error: "Login falhou. Tente novamente",
    });
  }
};
module.exports = {
  registoUser,
  loginUser,
  sair,
  autenticarToken: autenticarTokenUser,
  autenticarTokenEntidade,
  autenticarTokenLocalidade,
  registoEntidade,
  loginEntidade,
  registoEntidade,
  loginEntidade,
  registoLocalidade,
  loginLocalidade,
};
