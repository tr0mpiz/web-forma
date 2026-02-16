// Preview de imágenes
document.getElementById('coleccionImagen').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('coleccionImagenPreview');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            preview.innerHTML = `<img src="${event.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 4px;">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
});

document.getElementById('productoImagen').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('productoImagenPreview');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            preview.innerHTML = `<img src="${event.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 4px;">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
});

document.getElementById('categoriaImagen').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('categoriaImagenPreview');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            preview.innerHTML = `<img src="${event.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 4px;">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
});

const API_URL = 'http://localhost:3001/api';

// Mostrar/Ocultar secciones
function mostrarSeccion(seccion) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(seccion).classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
    event.target.closest('.nav-link').classList.add('active');
    
    if (seccion === 'dashboard') {
        cargarDashboard();
    } else if (seccion === 'productos') {
        cargarProductos();
    } else if (seccion === 'colecciones') {
        cargarColecciones();
    } else if (seccion === 'categorias') {
        cargarCategorias();
    } else if (seccion === 'banner') {
        cargarConfiguracionBanner();
    } else if (seccion === 'carousel') {
        cargarCarousel();
    }
}

// ===== DASHBOARD =====
async function cargarDashboard() {
    try {
        const prodRes = await fetch(`${API_URL}/productos`);
        const productos = await prodRes.json();
        
        const colRes = await fetch(`${API_URL}/colecciones`);
        const colecciones = await colRes.json();
        
        const catRes = await fetch(`${API_URL}/categorias`);
        const categorias = await catRes.json();
        
        const productosEnSale = productos.filter(p => p.sale).length;
        
        document.getElementById('totalProductos').textContent = productos.length;
        document.getElementById('totalColecciones').textContent = colecciones.length;
        document.getElementById('productosEnSale').textContent = productosEnSale;
        
        // Opcional: mostrar también categorías si agregas un elemento en el HTML
        if (document.getElementById('totalCategorias')) {
            document.getElementById('totalCategorias').textContent = categorias.length;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// ===== PRODUCTOS =====
async function cargarProductos() {
    try {
        const res = await fetch(`${API_URL}/productos`);
        const productos = await res.json();
        
        const tbody = document.querySelector('#tablaProductos tbody');
        tbody.innerHTML = '';
        
        productos.forEach(producto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${producto.id}</td>
                <td>${producto.nombre}</td>
                <td>$${producto.precio}</td>
                <td>${producto.coleccion}</td>
                <td>${producto.sale ? 'Sí' : 'No'}</td>
                <td>${producto.stock ? 'Sí' : 'No'}</td>
                <td>
                    <button class="btn btn-edit" onclick="editarProducto(${producto.id})">Editar</button>
                    <button class="btn btn-danger" onclick="eliminarProducto(${producto.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Cargar colecciones y categorías en select
        await cargarColeccionesSelect();
        await cargarCategoriasSelect();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarColeccionesSelect() {
    try {
        const res = await fetch(`${API_URL}/colecciones`);
        const colecciones = await res.json();
        
        const select = document.getElementById('productoColeccion');
        select.innerHTML = '';
        
        colecciones.forEach(col => {
            const option = document.createElement('option');
            option.value = col.nombre;
            option.textContent = col.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarCategoriasSelect() {
    try {
        const res = await fetch(`${API_URL}/categorias`);
        const categorias = await res.json();
        
        const select = document.getElementById('productoCategoria');
        select.innerHTML = '';
        
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.nombre;
            option.textContent = cat.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// ===== VARIANTES =====
let productVariantes = [];
let varianteCounter = 0;

function agregarVariante() {
    varianteCounter++;
    const varianteId = `variante-${varianteCounter}`;
    const container = document.getElementById('variantesContainer');
    
    const varianteDiv = document.createElement('div');
    varianteDiv.className = 'variante-item';
    varianteDiv.id = varianteId;
    varianteDiv.innerHTML = `
        <div class="variante-header">
            <h4>Variante ${varianteCounter}</h4>
            <button type="button" class="btn-remove-variante" onclick="eliminarVariante('${varianteId}')">✕</button>
        </div>
        <div class="variante-inputs">
            <div class="variante-field">
                <label>Alto (cm)</label>
                <input type="number" class="variante-alto" min="0">
            </div>
            <div class="variante-field">
                <label>Ancho (cm)</label>
                <input type="number" class="variante-ancho" min="0">
            </div>
            <div class="variante-field">
                <label>Profundidad (cm)</label>
                <input type="number" class="variante-profundidad" min="0">
            </div>
            <div class="variante-field">
                <label>Color</label>
                <input type="text" class="variante-color">
            </div>
        </div>
    `;
    
    container.appendChild(varianteDiv);
    productVariantes.push({ id: varianteId, alto: '', ancho: '', profundidad: '', color: '' });
}

function eliminarVariante(varianteId) {
    const element = document.getElementById(varianteId);
    if (element) {
        element.remove();
    }
    productVariantes = productVariantes.filter(v => v.id !== varianteId);
}

function obtenerVariantesDelFormulario() {
    const variantes = [];
    const items = document.querySelectorAll('.variante-item');
    
    items.forEach(item => {
        const alto = item.querySelector('.variante-alto').value;
        const ancho = item.querySelector('.variante-ancho').value;
        const profundidad = item.querySelector('.variante-profundidad').value;
        const color = item.querySelector('.variante-color').value;
        
        if (alto || ancho || profundidad || color) {
            variantes.push({
                alto: alto ? parseInt(alto) : null,
                ancho: ancho ? parseInt(ancho) : null,
                profundidad: profundidad ? parseInt(profundidad) : null,
                color: color || null
            });
        }
    });
    
    return variantes.length > 0 ? variantes : null;
}

function cargarVariantesEnFormulario(variantes) {
    const container = document.getElementById('variantesContainer');
    container.innerHTML = '';
    productVariantes = [];
    varianteCounter = 0;
    
    if (variantes && Array.isArray(variantes)) {
        variantes.forEach(variante => {
            varianteCounter++;
            const varianteId = `variante-${varianteCounter}`;
            
            const varianteDiv = document.createElement('div');
            varianteDiv.className = 'variante-item';
            varianteDiv.id = varianteId;
            varianteDiv.innerHTML = `
                <div class="variante-header">
                    <h4>Variante ${varianteCounter}</h4>
                    <button type="button" class="btn-remove-variante" onclick="eliminarVariante('${varianteId}')">✕</button>
                </div>
                <div class="variante-inputs">
                    <div class="variante-field">
                        <label>Alto (cm)</label>
                        <input type="number" class="variante-alto" value="${variante.alto || ''}" min="0">
                    </div>
                    <div class="variante-field">
                        <label>Ancho (cm)</label>
                        <input type="number" class="variante-ancho" value="${variante.ancho || ''}" min="0">
                    </div>
                    <div class="variante-field">
                        <label>Profundidad (cm)</label>
                        <input type="number" class="variante-profundidad" value="${variante.profundidad || ''}" min="0">
                    </div>
                    <div class="variante-field">
                        <label>Color</label>
                        <input type="text" class="variante-color" value="${variante.color || ''}">
                    </div>
                </div>
            `;
            
            container.appendChild(varianteDiv);
            productVariantes.push({ id: varianteId, ...variante });
        });
    }
}

function abrirFormularioProducto() {
    document.getElementById('productoId').value = '';
    document.getElementById('formularioProducto').reset();
    document.getElementById('variantesContainer').innerHTML = '';
    productVariantes = [];
    document.getElementById('formularioProductoContainer').style.display = 'block';
}

function cerrarFormularioProducto() {
    document.getElementById('formularioProductoContainer').style.display = 'none';
    productVariantes = [];
}

document.getElementById('formularioProducto').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('productoId').value;
    const imagenInput = document.getElementById('productoImagen');
    const archivo = imagenInput.files.length > 0 ? imagenInput.files[0] : null;
    
    // Si hay un archivo, subir primero
    let imagenPath = '';
    if (archivo) {
        const formData = new FormData();
        formData.append('file', archivo);
        
        try {
            const uploadRes = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                imagenPath = uploadData.filePath;
            } else {
                mostrarMensaje('mensajeProducto', 'Error al cargar la imagen', 'error');
                return;
            }
        } catch (error) {
            mostrarMensaje('mensajeProducto', 'Error al cargar la imagen', 'error');
            console.error('Error:', error);
            return;
        }
    } else if (id) {
        // Si estamos editando y no hay archivo nuevo, mantener imagen anterior
        const resActual = await fetch(`${API_URL}/productos/${id}`);
        const productoActual = await resActual.json();
        imagenPath = productoActual.imagen;
    }
    
    const producto = {
        nombre: document.getElementById('productoNombre').value,
        descripcion: document.getElementById('productoDescripcion').value,
        precio: parseInt(document.getElementById('productoPrecio').value),
        alto: parseInt(document.getElementById('productoAlto').value),
        ancho: parseInt(document.getElementById('productoAncho').value),
        profundidad: parseInt(document.getElementById('productoProfundidad').value),
        color: document.getElementById('productoColor').value,
        coleccion: document.getElementById('productoColeccion').value,
        categoria: document.getElementById('productoCategoria').value,
        imagen: imagenPath,
        sale: document.getElementById('productoSale').checked,
        stock: document.getElementById('productoStock').checked,
        cantidad_stock: parseInt(document.getElementById('productoCantidadStock').value),
        variantes: obtenerVariantesDelFormulario()
    };
    
    try {
        let res;
        if (id) {
            res = await fetch(`${API_URL}/productos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(producto)
            });
        } else {
            res = await fetch(`${API_URL}/productos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(producto)
            });
        }
        
        if (res.ok) {
            mostrarMensaje('mensajeProducto', 'Producto guardado exitosamente', 'success');
            cerrarFormularioProducto();
            cargarProductos();
        }
    } catch (error) {
        mostrarMensaje('mensajeProducto', 'Error al guardar producto', 'error');
        console.error('Error:', error);
    }
});

async function editarProducto(id) {
    try {
        const res = await fetch(`${API_URL}/productos/${id}`);
        const producto = await res.json();
        
        document.getElementById('productoId').value = producto.id;
        document.getElementById('productoNombre').value = producto.nombre;
        document.getElementById('productoDescripcion').value = producto.descripcion;
        document.getElementById('productoPrecio').value = producto.precio;
        document.getElementById('productoAlto').value = producto.alto;
        document.getElementById('productoAncho').value = producto.ancho;
        document.getElementById('productoProfundidad').value = producto.profundidad;
        document.getElementById('productoColor').value = producto.color;
        document.getElementById('productoColeccion').value = producto.coleccion;
        document.getElementById('productoCategoria').value = producto.categoria;
        document.getElementById('productoSale').checked = producto.sale;
        document.getElementById('productoStock').checked = producto.stock;
        document.getElementById('productoCantidadStock').value = producto.cantidad_stock;
        
        // Mostrar imagen actual si existe
        const previewDiv = document.getElementById('productoImagenPreview');
        if (producto.imagen && producto.imagen.trim() !== '') {
            previewDiv.innerHTML = `<img src="${producto.imagen}" style="max-width: 200px; max-height: 150px; border-radius: 4px;">`;
        } else {
            previewDiv.innerHTML = '';
        }
        
        // Cargar variantes si existen
        cargarVariantesEnFormulario(producto.variantes);
        
        document.getElementById('formularioProductoContainer').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
    }
}

async function eliminarProducto(id) {
    if (confirm('¿Eliminar este producto?')) {
        try {
            const res = await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE' });
            if (res.ok) {
                mostrarMensaje('mensajeProducto', 'Producto eliminado', 'success');
                cargarProductos();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// ===== COLECCIONES =====
async function cargarColecciones() {
    try {
        const res = await fetch(`${API_URL}/colecciones`);
        const colecciones = await res.json();
        
        const tbody = document.querySelector('#tablaColecciones tbody');
        tbody.innerHTML = '';
        
        colecciones.forEach(col => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${col.id}</td>
                <td>${col.nombre}</td>
                <td>${col.descripcion}</td>
                <td>
                    <button class="btn btn-edit" onclick="editarColeccion(${col.id})">Editar</button>
                    <button class="btn btn-danger" onclick="eliminarColeccion(${col.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

function abrirFormularioColeccion() {
    document.getElementById('coleccionId').value = '';
    document.getElementById('formularioColeccion').reset();
    document.getElementById('formularioColeccionContainer').style.display = 'block';
}

function cerrarFormularioColeccion() {
    document.getElementById('formularioColeccionContainer').style.display = 'none';
}

document.getElementById('formularioColeccion').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('coleccionId').value;
    const nombre = document.getElementById('coleccionNombre').value;
    const descripcion = document.getElementById('coleccionDescripcion').value;
    const imagenFile = document.getElementById('coleccionImagen').files[0];
    
    let imagen = '';
    
    // Si hay archivo nuevo, subirlo
    if (imagenFile) {
        const formData = new FormData();
        formData.append('file', imagenFile);
        
        try {
            const uploadRes = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                imagen = uploadData.filePath;
            } else {
                mostrarMensaje('mensajeColeccion', 'Error al subir imagen', 'error');
                return;
            }
        } catch (error) {
            mostrarMensaje('mensajeColeccion', 'Error al subir imagen', 'error');
            console.error('Error:', error);
            return;
        }
    } else if (id) {
        // Si estamos editando y NO hay archivo nuevo, mantener la imagen actual
        try {
            const res = await fetch(`${API_URL}/colecciones/${id}`);
            const coleccionActual = await res.json();
            imagen = coleccionActual.imagen || '';
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    const coleccion = {
        nombre: nombre,
        descripcion: descripcion,
        imagen: imagen
    };
    
    try {
        let res;
        if (id) {
            res = await fetch(`${API_URL}/colecciones/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(coleccion)
            });
        } else {
            res = await fetch(`${API_URL}/colecciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(coleccion)
            });
        }
        
        if (res.ok) {
            mostrarMensaje('mensajeColeccion', 'Colección guardada exitosamente', 'success');
            cerrarFormularioColeccion();
            cargarColecciones();
            cargarColeccionesSelect();
        }
    } catch (error) {
        mostrarMensaje('mensajeColeccion', 'Error al guardar colección', 'error');
        console.error('Error:', error);
    }
});

async function editarColeccion(id) {
    try {
        const res = await fetch(`${API_URL}/colecciones/${id}`);
        const coleccion = await res.json();
        
        document.getElementById('coleccionId').value = coleccion.id;
        document.getElementById('coleccionNombre').value = coleccion.nombre;
        document.getElementById('coleccionDescripcion').value = coleccion.descripcion;
        // No asignar valor a input file (por seguridad del navegador)
        // El campo file se queda vacío para permitir cambiar la imagen
        
        // Mostrar imagen actual si existe
        const preview = document.getElementById('coleccionImagenPreview');
        if (coleccion.imagen) {
            preview.innerHTML = `<div><strong>Imagen actual:</strong><br><img src="${coleccion.imagen}" style="max-width: 200px; max-height: 200px; border-radius: 4px; margin-top: 10px;"></div>`;
        } else {
            preview.innerHTML = '';
        }
        
        document.getElementById('formularioColeccionContainer').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
    }
}

async function eliminarColeccion(id) {
    if (confirm('¿Eliminar esta colección?')) {
        try {
            const res = await fetch(`${API_URL}/colecciones/${id}`, { method: 'DELETE' });
            if (res.ok) {
                mostrarMensaje('mensajeColeccion', 'Colección eliminada', 'success');
                cargarColecciones();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

function mostrarMensaje(elementId, texto, tipo) {
    const elemento = document.getElementById(elementId);
    elemento.innerHTML = `<div class="${tipo}">${texto}</div>`;
    setTimeout(() => {
        elemento.innerHTML = '';
    }, 3000);
}

// ===== CATEGORIAS =====
async function cargarCategorias() {
    try {
        const res = await fetch(`${API_URL}/categorias`);
        const categorias = await res.json();
        
        const tbody = document.querySelector('#tablaCategorias tbody');
        tbody.innerHTML = '';
        
        categorias.forEach(cat => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cat.id}</td>
                <td>${cat.nombre}</td>
                <td>${cat.descripcion}</td>
                <td>
                    <button class="btn btn-edit" onclick="editarCategoria(${cat.id})">Editar</button>
                    <button class="btn btn-danger" onclick="eliminarCategoria(${cat.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

function abrirFormularioCategoria() {
    document.getElementById('categoriaId').value = '';
    document.getElementById('formularioCategoria').reset();
    document.getElementById('formularioCategoriaContainer').style.display = 'block';
}

function cerrarFormularioCategoria() {
    document.getElementById('formularioCategoriaContainer').style.display = 'none';
}

document.getElementById('formularioCategoria').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('categoriaId').value;
    const nombre = document.getElementById('categoriaNombre').value;
    const descripcion = document.getElementById('categoriaDescripcion').value;
    const imagenFile = document.getElementById('categoriaImagen').files[0];
    
    let imagen = '';
    
    // Si hay archivo nuevo, subirlo
    if (imagenFile) {
        const formData = new FormData();
        formData.append('file', imagenFile);
        
        try {
            const uploadRes = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                imagen = uploadData.filePath;
            } else {
                mostrarMensaje('mensajeCategoria', 'Error al subir imagen', 'error');
                return;
            }
        } catch (error) {
            mostrarMensaje('mensajeCategoria', 'Error al subir imagen', 'error');
            console.error('Error:', error);
            return;
        }
    } else if (id) {
        // Si estamos editando y NO hay archivo nuevo, mantener la imagen actual
        try {
            const res = await fetch(`${API_URL}/categorias/${id}`);
            const categoriaActual = await res.json();
            imagen = categoriaActual.imagen || '';
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    const categoria = {
        nombre: nombre,
        descripcion: descripcion,
        imagen: imagen
    };
    
    try {
        let res;
        if (id) {
            res = await fetch(`${API_URL}/categorias/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoria)
            });
        } else {
            res = await fetch(`${API_URL}/categorias`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoria)
            });
        }
        
        if (res.ok) {
            mostrarMensaje('mensajeCategoria', 'Categoría guardada exitosamente', 'success');
            cerrarFormularioCategoria();
            cargarCategorias();
        }
    } catch (error) {
        mostrarMensaje('mensajeCategoria', 'Error al guardar categoría', 'error');
        console.error('Error:', error);
    }
});

async function editarCategoria(id) {
    try {
        const res = await fetch(`${API_URL}/categorias/${id}`);
        const categoria = await res.json();
        
        document.getElementById('categoriaId').value = categoria.id;
        document.getElementById('categoriaNombre').value = categoria.nombre;
        document.getElementById('categoriaDescripcion').value = categoria.descripcion;
        // No asignar valor a input file (por seguridad del navegador)
        // El campo file se queda vacío para permitir cambiar la imagen
        
        // Mostrar imagen actual si existe
        const preview = document.getElementById('categoriaImagenPreview');
        if (categoria.imagen) {
            preview.innerHTML = `<div><strong>Imagen actual:</strong><br><img src="${categoria.imagen}" style="max-width: 200px; max-height: 200px; border-radius: 4px; margin-top: 10px;"></div>`;
        } else {
            preview.innerHTML = '';
        }
        
        document.getElementById('formularioCategoriaContainer').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
    }
}

async function eliminarCategoria(id) {
    if (confirm('¿Eliminar esta categoría?')) {
        try {
            const res = await fetch(`${API_URL}/categorias/${id}`, { method: 'DELETE' });
            if (res.ok) {
                mostrarMensaje('mensajeCategoria', 'Categoría eliminada', 'success');
                cargarCategorias();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// ===== BANNER =====
async function cargarConfiguracionBanner() {
    try {
        const res = await fetch(`${API_URL}/banner`);
        const data = await res.json();
        
        document.getElementById('bannerMensaje').value = data.message;
        document.getElementById('bannerPreview').textContent = data.message;
    } catch (error) {
        console.error('Error cargando banner:', error);
        mostrarMensaje('mensajeBanner', 'Error cargando banner', 'error');
    }
}

document.getElementById('formularioBanner')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mensaje = document.getElementById('bannerMensaje').value.trim();
    
    if (!mensaje) {
        mostrarMensaje('mensajeBanner', 'Por favor ingresa un mensaje', 'error');
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/banner`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: mensaje })
        });
        
        const data = await res.json();
        document.getElementById('bannerPreview').textContent = data.message;
        mostrarMensaje('mensajeBanner', 'Banner actualizado correctamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('mensajeBanner', 'Error al guardar el banner', 'error');
    }
});

// ===== CAROUSEL =====
let carouselEditandoId = null;

function abrirFormularioCarousel() {
    carouselEditandoId = null;
    document.getElementById('formularioCarousel').reset();
    document.getElementById('formularioCarouselContainer').style.display = 'block';
    document.getElementById('carouselMedia').style.display = 'none';
    document.getElementById('carouselMediaPreview').innerHTML = '';
}

function cerrarFormularioCarousel() {
    document.getElementById('formularioCarouselContainer').style.display = 'none';
    document.getElementById('formularioCarousel').reset();
    carouselEditandoId = null;
    document.getElementById('carouselMedia').style.display = 'none';
    document.getElementById('carouselMediaPreview').innerHTML = '';
}

function actualizarTipoMedia() {
    const tipo = document.getElementById('carouselTipo').value;
    const grupoArchivo = document.getElementById('grupoMediaArchivo');
    const grupoURL = document.getElementById('grupoMediaURL');
    const preview = document.getElementById('carouselMediaPreview');
    
    if (tipo === 'ninguno') {
        grupoArchivo.style.display = 'none';
        grupoURL.style.display = 'none';
        preview.innerHTML = '';
        document.getElementById('carouselMediaArchivo').value = '';
        document.getElementById('carouselMediaURL').value = '';
    } else if (tipo === 'imagen') {
        grupoArchivo.style.display = 'block';
        grupoURL.style.display = 'block';
        document.getElementById('archivoInfo').textContent = 'Selecciona una imagen de tu equipo';
        document.getElementById('carouselMediaArchivo').accept = 'image/*';
    } else if (tipo === 'video') {
        grupoArchivo.style.display = 'block';
        grupoURL.style.display = 'block';
        document.getElementById('archivoInfo').textContent = 'Selecciona un video de tu equipo O pega link de YouTube';
        document.getElementById('carouselMediaArchivo').accept = 'video/*';
    }
}

async function cargarCarousel() {
    try {
        const res = await fetch(`${API_URL}/carousel`);
        const slides = await res.json();
        
        const tabla = document.getElementById('tablaCarousel');
        tabla.innerHTML = '';
        
        slides.forEach(slide => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${slide.titulo}</td>
                <td>${slide.tipo_media || 'Ninguno'}</td>
                <td><span class="badge ${slide.activo ? 'badge-success' : 'badge-secondary'}">${slide.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                    <button type="button" class="btn btn-sm btn-warning" onclick="editarCarousel(${slide.id})">Editar</button>
                    <button type="button" class="btn btn-sm btn-danger" onclick="eliminarCarousel(${slide.id})">Eliminar</button>
                </td>
            `;
            tabla.appendChild(fila);
        });
    } catch (error) {
        console.error('Error cargando carousel:', error);
        mostrarMensaje('mensajeCarousel', 'Error cargando carousel', 'error');
    }
}

async function editarCarousel(id) {
    try {
        const res = await fetch(`${API_URL}/carousel`);
        const slides = await res.json();
        const slide = slides.find(s => s.id === id);
        
        if (!slide) return;
        
        carouselEditandoId = id;
        document.getElementById('carouselTitulo').value = slide.titulo;
        document.getElementById('carouselDescripcion').value = slide.descripcion;
        document.getElementById('carouselTipo').value = slide.tipo_media || 'ninguno';
        document.getElementById('carouselMediaArchivo').value = '';
        document.getElementById('carouselMediaURL').value = slide.media_url || '';
        document.getElementById('carouselBotonTexto').value = slide.boton_texto || '';
        document.getElementById('carouselBotonLink').value = slide.boton_link || '';
        document.getElementById('carouselActivo').checked = slide.activo;
        
        // Mostrar preview si existe media
        if (slide.media_url) {
            const preview = document.getElementById('carouselMediaPreview');
            if (slide.tipo_media === 'imagen') {
                preview.innerHTML = `<img src="${slide.media_url}" style="max-width: 200px; max-height: 200px; border-radius: 4px;">`;
            } else if (slide.tipo_media === 'video') {
                // Detectar si es YouTube
                if (slide.media_url.includes('youtube.com') || slide.media_url.includes('youtu.be')) {
                    const videoId = extractYoutubeId(slide.media_url);
                    preview.innerHTML = `<iframe width="200" height="200" src="https://www.youtube.com/embed/${videoId}" style="border-radius: 4px;"></iframe>`;
                } else {
                    preview.innerHTML = `<video width="200" height="200" controls style="border-radius: 4px;"><source src="${slide.media_url}"></video>`;
                }
            }
        }
        
        actualizarTipoMedia();
        document.getElementById('formularioCarouselContainer').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
    }
}

async function guardarCarousel() {
    const titulo = document.getElementById('carouselTitulo').value.trim();
    const descripcion = document.getElementById('carouselDescripcion').value.trim();
    const tipo = document.getElementById('carouselTipo').value;
    const archivoInput = document.getElementById('carouselMediaArchivo');
    const urlInput = document.getElementById('carouselMediaURL').value.trim();
    const botonTexto = document.getElementById('carouselBotonTexto').value.trim();
    const botonLink = document.getElementById('carouselBotonLink').value.trim();
    const activo = document.getElementById('carouselActivo').checked;
    
    if (!titulo) {
        mostrarMensaje('mensajeCarousel', 'Por favor ingresa un título', 'error');
        return;
    }
    
    let mediaUrl = '';
    
    // Si hay archivo seleccionado
    if (archivoInput.files.length > 0) {
        const file = archivoInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const uploadRes = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                mediaUrl = uploadData.filePath;
            } else {
                mostrarMensaje('mensajeCarousel', 'Error al cargar el archivo', 'error');
                return;
            }
        } catch (error) {
            mostrarMensaje('mensajeCarousel', 'Error al cargar el archivo', 'error');
            console.error('Error:', error);
            return;
        }
    } else if (urlInput) {
        // Si hay URL ingresada
        mediaUrl = urlInput;
    } else if (tipo !== 'ninguno') {
        mostrarMensaje('mensajeCarousel', 'Por favor selecciona una imagen/video o ingresa una URL', 'error');
        return;
    }
    
    try {
        const slide = {
            titulo: titulo,
            descripcion: descripcion,
            tipo_media: tipo,
            media_url: mediaUrl,
            boton_texto: botonTexto,
            boton_link: botonLink,
            activo: activo
        };
        
        const url = carouselEditandoId ? `${API_URL}/carousel/${carouselEditandoId}` : `${API_URL}/carousel`;
        const method = carouselEditandoId ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slide)
        });
        
        if (res.ok) {
            mostrarMensaje('mensajeCarousel', carouselEditandoId ? 'Slide actualizado correctamente' : 'Slide creado correctamente', 'success');
            cerrarFormularioCarousel();
            cargarCarousel();
        } else {
            mostrarMensaje('mensajeCarousel', 'Error al guardar el slide', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('mensajeCarousel', 'Error al guardar el slide', 'error');
    }
}

async function eliminarCarousel(id) {
    if (confirm('¿Eliminar este slide del carousel?')) {
        try {
            const res = await fetch(`${API_URL}/carousel/${id}`, { method: 'DELETE' });
            if (res.ok) {
                mostrarMensaje('mensajeCarousel', 'Slide eliminado', 'success');
                cargarCarousel();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// Cargar carousel cuando se abre la sección
const carouselSection = document.getElementById('carousel');
if (carouselSection) {
    const observer = new MutationObserver(() => {
        if (carouselSection.classList.contains('active')) {
            cargarCarousel();
        }
    });
    observer.observe(carouselSection, { attributes: true });
}

// Event listener para el formulario del carousel
document.getElementById('formularioCarousel')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    guardarCarousel();
});

// Función helper para extraer ID de YouTube
function extractYoutubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
}

// Event listener para cambios en el archivo de media
document.getElementById('carouselMediaArchivo')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('carouselMediaPreview');
    const tipo = document.getElementById('carouselTipo').value;
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            if (tipo === 'imagen') {
                preview.innerHTML = `<img src="${event.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 4px;">`;
            } else if (tipo === 'video') {
                preview.innerHTML = `<video width="200" height="200" controls style="border-radius: 4px;"><source src="${event.target.result}"></video>`;
            }
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
});

// Event listener para cambios en la URL de media
document.getElementById('carouselMediaURL')?.addEventListener('change', function(e) {
    const url = e.target.value.trim();
    const preview = document.getElementById('carouselMediaPreview');
    const tipo = document.getElementById('carouselTipo').value;
    
    if (url) {
        if (tipo === 'imagen') {
            preview.innerHTML = `<img src="${url}" style="max-width: 200px; max-height: 200px; border-radius: 4px; object-fit: cover;">`;
        } else if (tipo === 'video') {
            // Detectar si es YouTube
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const videoId = extractYoutubeId(url);
                if (videoId) {
                    preview.innerHTML = `<iframe width="200" height="200" src="https://www.youtube.com/embed/${videoId}" style="border-radius: 4px;"></iframe>`;
                }
            } else {
                preview.innerHTML = `<video width="200" height="200" controls style="border-radius: 4px;"><source src="${url}"></video>`;
            }
        }
    } else {
        preview.innerHTML = '';
    }
});

// Event listener para el formulario del carousel
document.getElementById('formularioCarousel')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await guardarCarousel();
});

// Cargar dashboard al iniciar
window.addEventListener('load', cargarDashboard);
