const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Configurar multer para cargas de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, 'images');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${timestamp}${ext}`);
    }
});

const upload = multer({ storage: storage });

// Rutas de archivos
const PRODUCTOS_FILE = path.join(__dirname, 'data', 'productos.json');
const COLECCIONES_FILE = path.join(__dirname, 'data', 'colecciones.json');
const CATEGORIAS_FILE = path.join(__dirname, 'data', 'categorias.json');
const CONFIG_FILE = path.join(__dirname, 'data', 'config.json');
const CAROUSEL_FILE = path.join(__dirname, 'data', 'carousel.json');

// Funciones auxiliares
function leerProductos() {
  try {
    const data = fs.readFileSync(PRODUCTOS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function guardarProductos(productos) {
  fs.writeFileSync(PRODUCTOS_FILE, JSON.stringify(productos, null, 2));
}

function leerColecciones() {
  try {
    const data = fs.readFileSync(COLECCIONES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function guardarColecciones(colecciones) {
  fs.writeFileSync(COLECCIONES_FILE, JSON.stringify(colecciones, null, 2));
}

function leerCategorias() {
  try {
    const data = fs.readFileSync(CATEGORIAS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function guardarCategorias(categorias) {
  fs.writeFileSync(CATEGORIAS_FILE, JSON.stringify(categorias, null, 2));
}

function leerConfig() {
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { bannerMessage: '20% off por transferencia | 6 cuotas sin interés | Envío gratis a partir de $1M en CABA' };
  }
}

function guardarConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function leerCarousel() {
  try {
    const data = fs.readFileSync(CAROUSEL_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function guardarCarousel(carousel) {
  fs.writeFileSync(CAROUSEL_FILE, JSON.stringify(carousel, null, 2));
}

// ===== RUTA DE UPLOAD =====

// POST upload de archivo
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }

  const filePath = `/images/${req.file.filename}`;
  res.json({ 
    message: 'Archivo subido exitosamente',
    filePath: filePath,
    filename: req.file.filename
  });
});

// ===== RUTAS DE PRODUCTOS =====

// GET todos los productos
app.get('/api/productos', (req, res) => {
  const productos = leerProductos();
  res.json(productos);
});

// GET productos por colección
app.get('/api/productos/coleccion/:coleccion', (req, res) => {
  const productos = leerProductos();
  const filtrados = productos.filter(p => p.coleccion === req.params.coleccion);
  res.json(filtrados);
});

// GET productos en sale
app.get('/api/productos/sale/true', (req, res) => {
  const productos = leerProductos();
  const filtrados = productos.filter(p => p.sale === true);
  res.json(filtrados);
});

// GET un producto por ID
app.get('/api/productos/:id', (req, res) => {
  const productos = leerProductos();
  const producto = productos.find(p => p.id === parseInt(req.params.id));
  if (producto) {
    res.json(producto);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

// POST crear producto
app.post('/api/productos', (req, res) => {
  const productos = leerProductos();
  const nuevoProducto = {
    id: productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1,
    ...req.body
  };
  productos.push(nuevoProducto);
  guardarProductos(productos);
  res.status(201).json(nuevoProducto);
});

// PUT actualizar producto
app.put('/api/productos/:id', (req, res) => {
  const productos = leerProductos();
  const index = productos.findIndex(p => p.id === parseInt(req.params.id));
  if (index !== -1) {
    productos[index] = { ...productos[index], ...req.body };
    guardarProductos(productos);
    res.json(productos[index]);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

// DELETE producto
app.delete('/api/productos/:id', (req, res) => {
  let productos = leerProductos();
  const index = productos.findIndex(p => p.id === parseInt(req.params.id));
  if (index !== -1) {
    const eliminado = productos[index];
    productos = productos.filter((_, i) => i !== index);
    guardarProductos(productos);
    res.json(eliminado);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

// ===== RUTAS DE COLECCIONES =====

// GET todas las colecciones
app.get('/api/colecciones', (req, res) => {
  const colecciones = leerColecciones();
  res.json(colecciones);
});

// GET una colección por ID
app.get('/api/colecciones/:id', (req, res) => {
  const colecciones = leerColecciones();
  const coleccion = colecciones.find(c => c.id === parseInt(req.params.id));
  if (coleccion) {
    res.json(coleccion);
  } else {
    res.status(404).json({ error: 'Colección no encontrada' });
  }
});

// POST crear colección
app.post('/api/colecciones', (req, res) => {
  const colecciones = leerColecciones();
  const nuevaColeccion = {
    id: colecciones.length > 0 ? Math.max(...colecciones.map(c => c.id)) + 1 : 1,
    ...req.body
  };
  colecciones.push(nuevaColeccion);
  guardarColecciones(colecciones);
  res.status(201).json(nuevaColeccion);
});

// PUT actualizar colección
app.put('/api/colecciones/:id', (req, res) => {
  const colecciones = leerColecciones();
  const index = colecciones.findIndex(c => c.id === parseInt(req.params.id));
  if (index !== -1) {
    colecciones[index] = { ...colecciones[index], ...req.body };
    guardarColecciones(colecciones);
    res.json(colecciones[index]);
  } else {
    res.status(404).json({ error: 'Colección no encontrada' });
  }
});

// DELETE colección
app.delete('/api/colecciones/:id', (req, res) => {
  let colecciones = leerColecciones();
  const index = colecciones.findIndex(c => c.id === parseInt(req.params.id));
  if (index !== -1) {
    const eliminada = colecciones[index];
    colecciones = colecciones.filter((_, i) => i !== index);
    guardarColecciones(colecciones);
    res.json(eliminada);
  } else {
    res.status(404).json({ error: 'Colección no encontrada' });
  }
});

// ===== RUTAS DE CATEGORIAS =====

// GET todas las categorías
app.get('/api/categorias', (req, res) => {
  const categorias = leerCategorias();
  res.json(categorias);
});

// GET una categoría por ID
app.get('/api/categorias/:id', (req, res) => {
  const categorias = leerCategorias();
  const categoria = categorias.find(c => c.id === parseInt(req.params.id));
  if (categoria) {
    res.json(categoria);
  } else {
    res.status(404).json({ error: 'Categoría no encontrada' });
  }
});

// POST crear categoría
app.post('/api/categorias', (req, res) => {
  const categorias = leerCategorias();
  const nuevaCategoria = {
    id: categorias.length > 0 ? Math.max(...categorias.map(c => c.id)) + 1 : 1,
    ...req.body
  };
  categorias.push(nuevaCategoria);
  guardarCategorias(categorias);
  res.status(201).json(nuevaCategoria);
});

// PUT actualizar categoría
app.put('/api/categorias/:id', (req, res) => {
  const categorias = leerCategorias();
  const index = categorias.findIndex(c => c.id === parseInt(req.params.id));
  if (index !== -1) {
    categorias[index] = { ...categorias[index], ...req.body };
    guardarCategorias(categorias);
    res.json(categorias[index]);
  } else {
    res.status(404).json({ error: 'Categoría no encontrada' });
  }
});

// DELETE categoría
app.delete('/api/categorias/:id', (req, res) => {
  let categorias = leerCategorias();
  const index = categorias.findIndex(c => c.id === parseInt(req.params.id));
  if (index !== -1) {
    const eliminada = categorias[index];
    categorias = categorias.filter((_, i) => i !== index);
    guardarCategorias(categorias);
    res.json(eliminada);
  } else {
    res.status(404).json({ error: 'Categoría no encontrada' });
  }
});

// ===== RUTAS DE BANNER =====

// GET configuración del banner
app.get('/api/banner', (req, res) => {
  const config = leerConfig();
  res.json({ message: config.bannerMessage });
});

// PUT actualizar mensaje del banner
app.put('/api/banner', (req, res) => {
  const config = leerConfig();
  config.bannerMessage = req.body.message || config.bannerMessage;
  guardarConfig(config);
  res.json({ message: config.bannerMessage });
});

// ===== RUTAS DE CAROUSEL =====

// GET todos los slides del carousel
app.get('/api/carousel', (req, res) => {
  const carousel = leerCarousel();
  res.json(carousel);
});

// POST nuevo slide
app.post('/api/carousel', (req, res) => {
  const carousel = leerCarousel();
  const nuevoSlide = {
    id: carousel.length > 0 ? Math.max(...carousel.map(s => s.id)) + 1 : 1,
    ...req.body,
    orden: req.body.orden || carousel.length + 1
  };
  carousel.push(nuevoSlide);
  guardarCarousel(carousel);
  res.status(201).json(nuevoSlide);
});

// PUT actualizar slide
app.put('/api/carousel/:id', (req, res) => {
  const carousel = leerCarousel();
  const index = carousel.findIndex(s => s.id === parseInt(req.params.id));
  if (index !== -1) {
    carousel[index] = { ...carousel[index], ...req.body };
    guardarCarousel(carousel);
    res.json(carousel[index]);
  } else {
    res.status(404).json({ error: 'Slide no encontrado' });
  }
});

// DELETE slide
app.delete('/api/carousel/:id', (req, res) => {
  let carousel = leerCarousel();
  const index = carousel.findIndex(s => s.id === parseInt(req.params.id));
  if (index !== -1) {
    const eliminado = carousel[index];
    carousel = carousel.filter((_, i) => i !== index);
    guardarCarousel(carousel);
    res.json(eliminado);
  } else {
    res.status(404).json({ error: 'Slide no encontrado' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor FORMA corriendo en http://localhost:${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}/api`);
});
