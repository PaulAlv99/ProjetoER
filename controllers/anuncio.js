const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const crypto = require("crypto");
const Item = require("../models/Item");
const jwt = require("jsonwebtoken");

// Define storage path - one level up from the project root
const SECURE_STORAGE_PATH = path.join(__dirname, '../secure_uploads');

// Configure multer storage
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      await fs.mkdir(SECURE_STORAGE_PATH, { recursive: true });
      await fs.chmod(SECURE_STORAGE_PATH, 0o750);
      cb(null, SECURE_STORAGE_PATH);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    // Generate secure random filename
    const fileHash = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${fileHash}${ext}`);
  }
});

// Validate file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Tipo de arquivo não permitido'), false);
  }
  cb(null, true);
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10
  }
}).fields([{ name: "fotos", minCount: 5, maxCount: 10 }]);

// Verify file content type using magic numbers
async function verifyFileType(filePath) {
  const signatures = {
    '89504e47': 'image/png',
    'ffd8ffe0': 'image/jpeg',
    'ffd8ffe1': 'image/jpeg',
    '47494638': 'image/gif'
  };

  try {
    const buffer = await fs.readFile(filePath);
    const hex = buffer.toString('hex', 0, 4);
    return signatures[hex];
  } catch (error) {
    return null;
  }
}

const anunciarItem = async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        let errorMessage = "Erro no upload de arquivos";
        if (err.code === 'LIMIT_FILE_SIZE') {
          errorMessage = "Arquivo muito grande. Limite de 5MB por imagem";
        }
        return res.render("anuncioItensForm", { error: errorMessage });
      }

      if (err) {
        return res.render("anuncioItensForm", { error: err.message });
      }

      try {
        const { categoria, descricao, peso, localizacao, nome } = req.body;
        const { userId } = jwt.decode(req.cookies.token);

        if (!req.files?.fotos || req.files.fotos.length < 5) {
          return res.render("anuncioItensForm", {
            error: "Mínimo de 5 fotos necessário"
          });
        }

        // Verify each file type and create records
        const fotos = [];
        for (const file of req.files.fotos) {
          const verifiedType = await verifyFileType(file.path);
          if (!verifiedType) {
            // Clean up files and return error
            await Promise.all(req.files.fotos.map(f => fs.unlink(f.path)));
            return res.render("anuncioItensForm", {
              error: "Arquivo inválido detectado"
            });
          }

          fotos.push({
            path: path.relative(SECURE_STORAGE_PATH, file.path),
            contentType: verifiedType
          });
        }

        const item = new Item({
          idUtilizador: userId,
          categoria,
          nome,
          descricao,
          peso,
          localizacao,
          fotos
        });

        await item.save();
        return res.redirect("/");

      } catch (error) {
        // Clean up files on error
        if (req.files?.fotos) {
          await Promise.all(req.files.fotos.map(f => fs.unlink(f.path)));
        }
        return res.render("anuncioItensForm", {
          error: "Erro ao publicar item. Tente novamente."
        });
      }
    });
  } catch (error) {
    console.error("Erro ao anunciar item:", error);
    return res.render("anuncioItensForm", {
      error: "Erro ao publicar item. Tente novamente."
    });
  }
};

// Helper to get full file path
function getFullPath(relativePath) {
  return path.join(SECURE_STORAGE_PATH, relativePath);
}

module.exports = {
  anunciarItem,
  SECURE_STORAGE_PATH,
  getFullPath
};