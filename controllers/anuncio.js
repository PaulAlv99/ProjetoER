const multer = require("multer");
const Item = require("../models/Item");
const jwt = require("jsonwebtoken");
const upload = multer();

const anunciarItem = async (req, res) => {
  try {
    console.log(req.body);
    upload.fields([{ name: "fotos", minCount: 5, maxCount: 10 }])(
      req,
      res,
      async (err) => {
        if (err) {
          return res.render("anuncioItensForm", { error: err.message });
        }
        console.log(req.body);
        try {
          const { categoria, descricao, peso, localizacao, nome } = req.body;
          console.log(jwt.decode(req.cookies.token));
          const { userId, iat, exp } = jwt.decode(req.cookies.token);
          const fotosprovisorias = req.files.fotos;

          if (!req.files || !req.files.fotos) {
            return res.render("anuncioItensForm", {
              error: "Por favor faça upload de fotos",
            });
          }
          const fotos = fotosprovisorias.map((file) => {
            const buffer = file.buffer; // Buffer da imagem
            const contentType = file.mimetype; // Tipo de conteúdo (ex.: "image/png")
            // Retorna estrutura da imagem
            return {
              data: buffer,
              contentType: contentType,
            };
          });
          if (fotos.length < 5 || fotos.length >= 10) {
            return res.render("anuncioItensForm", {
              error: "Por favor faça upload de no minimo 5 fotos",
            });
          }
          let provisoriafotos = []; // Buffer onde iremos guardar as fotos
          let i = 0;
          while (i < req.files.fotos.length) {
            const fotoItem = {
              data: req.files.fotos[i].buffer.toString("utf8"), // O buffer da imagem
              // O tipo MIME da imagem (ex.: "image/jpeg")
            };
            provisoriafotos.push(fotoItem); // Adiciona o objeto formatado à lista de fotos
            i++;
            // console.log(req.files.fotos[i].buffer.toString("utf8"));
          }
          console.log(userId);
          const idUtilizador = userId;
          if (!idUtilizador) {
            return res.render("anuncioItensForm", {
              error: "Erro",
            });
          }
          const item = new Item({
            idUtilizador,
            categoria,
            nome,
            descricao,
            peso,
            localizacao,
            fotos,
          });

          await item.save();
          return res.redirect("/");
        } catch (error) {
          console.error("Erro de anuncio do item:", error);
          return res.render("anuncioItensForm", {
            error: "A publicacao do item falhou. Tente novamente",
          });
        }
      }
    );
  } catch (error) {
    console.error("Erro de anuncio do item:", error);
    return res.render("anuncioItensForm", {
      error: "A publicacao do item falhou. Tente novamente",
    });
  }
};

module.exports = {
  anunciarItem,
};
