// Sistema de Carrito
let cart = [];
let currentProduct = null;
let currentQty = 1;
const API_URL = 'http://localhost:3001/api';

// Cargar mensaje del banner desde la API
async function cargarBannerMessage() {
    try {
        const res = await fetch(`${API_URL}/banner`);
        const data = await res.json();
        const bannerMessage = data.message;
        
        // Actualizar el elemento del banner
        const bannerEl = document.getElementById('bannerMessage');
        
        if (bannerEl) bannerEl.textContent = bannerMessage;
    } catch (error) {
        console.error('Error cargando banner:', error);
    }
}

// Cargar productos desde la API
async function cargarProductos() {
    try {
        const res = await fetch(`${API_URL}/productos`);
        const productos = await res.json();
        
        renderizarProductos(productos.slice(0, 4), 'productosNovedades');
    } catch (error) {
        console.error('Error cargando productos:', error);
        // Si falla la API, mostrar mensaje
        document.getElementById('productosNovedades').innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Error cargando productos. Verifica que el servidor esté activo.</p>';
    }
}

function renderizarProductos(productos, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = '';
    
    productos.forEach(producto => {
        const tag = producto.sale ? 'Oferta' : 'Nuevo';
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <span class="product-tag">${tag}</span>
            </div>
            <div class="product-info">
                <h3>${producto.nombre}</h3>
                <p class="product-description">${producto.descripcion}</p>
                <p class="product-price">$${producto.precio.toLocaleString('es-AR')}</p>
                <button class=\"btn btn-secondary\">Ver Producto</button>
            </div>
        `;
        
        // Agregar evento al botón
        const btn = card.querySelector('.btn-secondary');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openProductModal(producto.nombre, producto.precio, producto.imagen, producto.descripcion, producto);
        });
        
        // Agregar evento a la imagen para también abrir el modal
        const img = card.querySelector('.product-image img');
        if (img) {
            img.style.cursor = 'pointer';
            img.addEventListener('click', (e) => {
                e.preventDefault();
                openProductModal(producto.nombre, producto.precio, producto.imagen, producto.descripcion, producto);
            });
        }
        
        contenedor.appendChild(card);
    });
}
// Carousel functionality - Manejado por cargarCarousel() desde la API

setInterval(() => {
    changeSlide(1);
}, 5000);

// Newsletter form
document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    alert(`Gracias por suscribirse con: ${email}`);
    this.reset();
});

// Add to cart functionality
document.querySelectorAll('.btn-secondary').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const card = this.closest('.product-card');
        const productName = card.querySelector('h3').textContent;
        const productPrice = parseInt(card.querySelector('.product-price').textContent.replace(/[^\d]/g, ''));
        const productImage = card.querySelector('.product-image img').src;
        const productDescription = card.querySelector('.product-description').textContent;
        
        openProductModal(productName, productPrice, productImage, productDescription);
    });
});

// Abrir modal de producto
function openProductModal(name, price, image, description, product = null) {
    currentProduct = { name, price, image, description, ...product };
    currentQty = 1;
    
    document.getElementById('modalProductName').textContent = name;
    document.getElementById('modalProductPrice').textContent = price.toLocaleString('es-AR');
    document.getElementById('modalProductImage').src = image;
    document.getElementById('zoomPreviewImg').src = image;
    document.getElementById('modalProductDescription').textContent = description;
    document.getElementById('modalQty').textContent = '1';
    
    // Mostrar especificaciones si existen
    if (product) {
        document.getElementById('modalProductAlto').textContent = product.alto || '-';
        document.getElementById('modalProductAncho').textContent = product.ancho || '-';
        document.getElementById('modalProductProfundidad').textContent = product.profundidad || '-';
        document.getElementById('modalProductColor').textContent = product.color || '-';
        document.getElementById('modalProductCategoria').textContent = product.categoria || '-';
        document.getElementById('modalProductColeccion').textContent = product.coleccion || '-';
        
        // Cargar variantes
        cargarVariantes(product);
    }
    
    const modal = document.getElementById('productModal');
    modal.style.display = 'block';
    
    // Inicializar zoom
    setupImageZoom();
    
    document.getElementById('addToCartBtn').onclick = function() {
        const variantSeleccionada = obtenerVarianteSeleccionada();
        const productoConVariante = { ...currentProduct, ...variantSeleccionada };
        addToCart(productoConVariante.name, productoConVariante.price, currentQty, productoConVariante);
        modal.style.display = 'none';
        showNotification(`${currentQty}x ${currentProduct.name} añadido al carrito`);
    };
}

// Cargar variantes disponibles
function cargarVariantes(product) {
    // Limpiar botones de medidas y color
    const variantesMedidasContainer = document.getElementById('variantesMedidasContainer');
    const colorButtonsContainer = document.getElementById('colorButtonsContainer');
    
    if (variantesMedidasContainer) {
        variantesMedidasContainer.innerHTML = '';
    }
    if (colorButtonsContainer) {
        colorButtonsContainer.innerHTML = '';
    }
    
    // Obtener variantes del producto
    const variantes = product.variantes || [];
    
    if (variantes.length === 0) {
        // Si no hay variantes personalizadas, ocultar selectores
        document.getElementById('variantesMedidasGroup').style.display = 'none';
        document.getElementById('colorVariantGroup').style.display = 'none';
        return;
    }
    
    // Crear botones de medidas (combinación de alto x ancho x profundidad)
    const medidasUnicas = [];
    const medidas = new Set();
    
    variantes.forEach(v => {
        const medidaStr = `${v.alto} x ${v.ancho} x ${v.profundidad}`;
        if (!medidas.has(medidaStr)) {
            medidas.add(medidaStr);
            medidasUnicas.push({
                alto: v.alto,
                ancho: v.ancho,
                profundidad: v.profundidad,
                texto: medidaStr
            });
        }
    });
    
    // Extraer colores únicos
    const colores = [...new Set(variantes.map(v => v.color).filter(v => v))];
    
    // Mostrar/ocultar grupos según disponibilidad
    document.getElementById('variantesMedidasGroup').style.display = medidasUnicas.length > 0 ? 'block' : 'none';
    document.getElementById('colorVariantGroup').style.display = colores.length > 0 ? 'block' : 'none';
    
    // Crear botones de medidas
    if (variantesMedidasContainer) {
        medidasUnicas.forEach(medida => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'medida-button';
            button.textContent = medida.texto;
            button.dataset.alto = medida.alto;
            button.dataset.ancho = medida.ancho;
            button.dataset.profundidad = medida.profundidad;
            button.addEventListener('click', function(e) {
                e.preventDefault();
                // Remover selección anterior
                variantesMedidasContainer.querySelectorAll('.medida-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                // Marcar este botón como activo
                button.classList.add('active');
                // Actualizar especificaciones
                actualizarEspecificacionesModal(product);
            });
            variantesMedidasContainer.appendChild(button);
        });
    }
    
    // Crear botones de color en lugar de dropdown
    if (colorButtonsContainer) {
        colores.forEach(color => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'color-button';
            button.textContent = color;
            button.value = color;
            button.addEventListener('click', function(e) {
                e.preventDefault();
                // Remover selección anterior
                colorButtonsContainer.querySelectorAll('.color-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                // Marcar este botón como activo
                button.classList.add('active');
                // Actualizar especificaciones
                actualizarEspecificacionesModal(product);
            });
            colorButtonsContainer.appendChild(button);
        });
    }
}

// Actualizar especificaciones en el modal cuando cambia una variante
function actualizarEspecificacionesModal(product) {
    // Obtener medidas seleccionadas desde los botones
    const medidaButtonActivo = document.querySelector('.medida-button.active');
    const altoSelect = medidaButtonActivo ? medidaButtonActivo.dataset.alto : '';
    const anchoSelect = medidaButtonActivo ? medidaButtonActivo.dataset.ancho : '';
    const profundidadSelect = medidaButtonActivo ? medidaButtonActivo.dataset.profundidad : '';
    
    // Obtener color seleccionado desde los botones
    const colorButtonActivo = document.querySelector('.color-button.active');
    const colorSelect = colorButtonActivo ? colorButtonActivo.value : '';
    
    // Buscar variante que coincida con las selecciones
    const variantes = product.variantes || [];
    const varianteSeleccionada = variantes.find(v => 
        (!altoSelect || v.alto == altoSelect) &&
        (!anchoSelect || v.ancho == anchoSelect) &&
        (!profundidadSelect || v.profundidad == profundidadSelect) &&
        (!colorSelect || v.color === colorSelect)
    );
    
    // Actualizar elementos de especificación
    if (varianteSeleccionada) {
        // Actualizar Alto
        let altoElement = document.querySelector('[data-spec="alto"]');
        if (!altoElement) {
            altoElement = document.getElementById('modalProductAlto');
        }
        if (altoElement) altoElement.textContent = varianteSeleccionada.alto + ' cm';
        
        // Actualizar Ancho
        let anchoElement = document.querySelector('[data-spec="ancho"]');
        if (!anchoElement) {
            anchoElement = document.getElementById('modalProductAncho');
        }
        if (anchoElement) anchoElement.textContent = varianteSeleccionada.ancho + ' cm';
        
        // Actualizar Profundidad
        let profundidadElement = document.querySelector('[data-spec="profundidad"]');
        if (!profundidadElement) {
            profundidadElement = document.getElementById('modalProductProfundidad');
        }
        if (profundidadElement) profundidadElement.textContent = varianteSeleccionada.profundidad + ' cm';
        
        // Actualizar Color
        let colorElement = document.querySelector('[data-spec="color"]');
        if (!colorElement) {
            colorElement = document.getElementById('modalProductColor');
        }
        if (colorElement) colorElement.textContent = varianteSeleccionada.color;
        
        // Actualizar Precio si la variante tiene precio diferente
        if (varianteSeleccionada.precio) {
            const priceElement = document.getElementById('modalProductPrice');
            if (priceElement) {
                priceElement.textContent = varianteSeleccionada.precio.toLocaleString('es-AR');
            }
        }
    }
    
    // Filtrar medidas disponibles según el color seleccionado
    const medidasDisponibles = new Set();
    const coloresDisponibles = new Set();
    
    variantes.forEach(v => {
        if (!colorSelect || v.color === colorSelect) {
            medidasDisponibles.add(`${v.alto}x${v.ancho}x${v.profundidad}`);
        }
        if (!altoSelect && !anchoSelect && !profundidadSelect) {
            coloresDisponibles.add(v.color);
        } else {
            if ((!altoSelect || v.alto == altoSelect) &&
                (!anchoSelect || v.ancho == anchoSelect) &&
                (!profundidadSelect || v.profundidad == profundidadSelect)) {
                coloresDisponibles.add(v.color);
            }
        }
    });
    
    // Si color está seleccionado pero no hay medidas disponibles, desseleccionar el color
    if (colorSelect && medidasDisponibles.size === 0) {
        if (colorButtonActivo) {
            colorButtonActivo.classList.remove('active');
        }
    }
    
    // Si medida está seleccionada pero no hay colores disponibles, desseleccionar la medida
    if ((altoSelect || anchoSelect || profundidadSelect) && coloresDisponibles.size === 0) {
        if (medidaButtonActivo) {
            medidaButtonActivo.classList.remove('active');
        }
    }
    
    // Deshabilitar/habilitar botones de medidas
    document.querySelectorAll('.medida-button').forEach(button => {
        const medidaText = `${button.dataset.alto}x${button.dataset.ancho}x${button.dataset.profundidad}`;
        const disponible = colorSelect === '' || medidasDisponibles.has(medidaText);
        button.disabled = !disponible;
    });
    
    // Deshabilitar/habilitar botones de color
    document.querySelectorAll('.color-button').forEach(button => {
        const disponible = (altoSelect === '' && anchoSelect === '' && profundidadSelect === '') || coloresDisponibles.has(button.value);
        button.disabled = !disponible;
    });
}

// Obtener la variante seleccionada
function obtenerVarianteSeleccionada() {
    // Obtener medidas seleccionadas desde los botones
    const medidaButtonActivo = document.querySelector('.medida-button.active');
    const altoSelect = medidaButtonActivo ? medidaButtonActivo.dataset.alto : '';
    const anchoSelect = medidaButtonActivo ? medidaButtonActivo.dataset.ancho : '';
    const profundidadSelect = medidaButtonActivo ? medidaButtonActivo.dataset.profundidad : '';
    
    // Obtener color seleccionado desde los botones
    const colorButtonActivo = document.querySelector('.color-button.active');
    const colorSelect = colorButtonActivo ? colorButtonActivo.value : '';
    
    return {
        alto_seleccionado: altoSelect || currentProduct.alto,
        ancho_seleccionado: anchoSelect || currentProduct.ancho,
        profundidad_seleccionada: profundidadSelect || currentProduct.profundidad,
        color_seleccionado: colorSelect || currentProduct.color
    };
}

// Reorganizar selección - limpiar filtros de variantes
function reorganizarSeleccion() {
    // Remover clase activa de todos los botones de medida
    document.querySelectorAll('.medida-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Remover clase activa de todos los botones de color
    document.querySelectorAll('.color-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Habilitar todos los botones
    document.querySelectorAll('.medida-button, .color-button').forEach(btn => {
        btn.disabled = false;
    });
    
    // Resetear especificaciones a valores por defecto
    if (currentProduct) {
        const altoElement = document.getElementById('modalProductAlto');
        const anchoElement = document.getElementById('modalProductAncho');
        const profundidadElement = document.getElementById('modalProductProfundidad');
        const colorElement = document.getElementById('modalProductColor');
        const priceElement = document.getElementById('modalProductPrice');
        
        if (altoElement) altoElement.textContent = currentProduct.alto + ' cm';
        if (anchoElement) anchoElement.textContent = currentProduct.ancho + ' cm';
        if (profundidadElement) profundidadElement.textContent = currentProduct.profundidad + ' cm';
        if (colorElement) colorElement.textContent = currentProduct.color;
        if (priceElement) priceElement.textContent = currentProduct.price.toLocaleString('es-AR');
    }
}

// Configurar efecto de zoom
function setupImageZoom() {
    const container = document.getElementById('zoomContainer');
    const img = document.getElementById('modalProductImage');
    const overlay = document.getElementById('zoomOverlay');
    const preview = document.getElementById('zoomPreview');
    const previewImg = document.getElementById('zoomPreviewImg');
    
    if (!container || !img) return;
    
    container.addEventListener('mousemove', function(e) {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Mostrar overlay y preview
        overlay.style.display = 'block';
        preview.style.display = 'block';
        
        // Posicionar overlay centrado en el mouse
        const overlaySize = 80;
        const overlayX = Math.max(0, Math.min(x - overlaySize / 2, rect.width - overlaySize));
        const overlayY = Math.max(0, Math.min(y - overlaySize / 2, rect.height - overlaySize));
        
        overlay.style.left = overlayX + 'px';
        overlay.style.top = overlayY + 'px';
        
        // Calcular qué porcentaje de la imagen está en el overlay (centered)
        const centerX = overlayX + overlaySize / 2;
        const centerY = overlayY + overlaySize / 2;
        
        const percentX = (centerX / rect.width) * 100;
        const percentY = (centerY / rect.height) * 100;
        
        // En el preview, mostrar eso centrado (con zoom 300%)
        previewImg.style.objectPosition = percentX + '% ' + percentY + '%';
    });
    
    container.addEventListener('mouseleave', function() {
        overlay.style.display = 'none';
        preview.style.display = 'none';
    });
}

// Aumentar/disminuir cantidad en modal
function increaseQtyModal() {
    currentQty++;
    document.getElementById('modalQty').textContent = currentQty;
}

function decreaseQtyModal() {
    if (currentQty > 1) {
        currentQty--;
        document.getElementById('modalQty').textContent = currentQty;
    }
}

// Cerrar modal de producto
document.addEventListener('DOMContentLoaded', function() {
    const productModal = document.getElementById('productModal');
    const cartModal = document.getElementById('cartModal');
    
    // Close button para producto modal
    const productCloseBtn = productModal.querySelector('.close-btn');
    if (productCloseBtn) {
        productCloseBtn.addEventListener('click', function() {
            productModal.style.display = 'none';
        });
    }
    
    // Close button para cart modal
    const cartCloseBtn = cartModal.querySelector('.close-btn');
    if (cartCloseBtn) {
        cartCloseBtn.addEventListener('click', function() {
            cartModal.style.display = 'none';
        });
    }
    
    // Click fuera del producto modal
    window.addEventListener('click', function(event) {
        if (event.target == productModal) {
            productModal.style.display = 'none';
        }
        if (event.target == cartModal) {
            cartModal.style.display = 'none';
        }
    });
});

function addToCart(productName, productPrice, quantity, productData = null) {
    for (let i = 0; i < quantity; i++) {
        const variantKey = productData 
            ? `${productName}-${productData.alto_seleccionado || productData.alto}-${productData.profundidad_seleccionada || productData.profundidad}-${productData.color_seleccionado || productData.color}`
            : productName;
        
        const existingItem = cart.find(item => item.variantKey === variantKey);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: Date.now() + i,
                variantKey: variantKey,
                name: productName,
                price: productPrice,
                quantity: 1,
                imagen: currentProduct.image || currentProduct.imagen || '-',
                color: productData?.color_seleccionado || currentProduct.color || '-',
                alto: productData?.alto_seleccionado || currentProduct.alto || '-',
                ancho: currentProduct.ancho || '-',
                profundidad: productData?.profundidad_seleccionada || currentProduct.profundidad || '-',
                categoria: currentProduct.categoria || '-'
            });
        }
    }
    
    updateCartCount();
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('.cart-count').textContent = totalItems;
}

function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartSummary = document.getElementById('cartSummary');
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '';
        cartEmpty.style.display = 'block';
        cartSummary.style.display = 'none';
        return;
    }
    
    cartEmpty.style.display = 'none';
    cartSummary.style.display = 'block';
    
    let html = '';
    let total = 0;
    let resumenProductos = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.imagen}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-specs">
                        ${item.color && item.color !== '-' ? `<span class="spec-badge">🎨 ${item.color}</span>` : ''}
                        ${item.alto && item.alto !== '-' ? `<span class="spec-badge">${item.alto}cm × ${item.ancho}cm × ${item.profundidad}cm</span>` : ''}
                    </div>
                    <div class="cart-item-price">$${item.price.toLocaleString('es-AR')}</div>
                </div>
                <div class="cart-item-qty">
                    <button onclick="decreaseQty(${item.id})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="increaseQty(${item.id})">+</button>
                </div>
                <button class="cart-remove" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        resumenProductos += `${item.name}${item.color && item.color !== '-' ? ' (' + item.color + ')' : ''} x${item.quantity} - $${(item.price * item.quantity).toLocaleString('es-AR')}\n`;
    });
    
    cartItemsDiv.innerHTML = html;
    document.getElementById('cartTotal').textContent = total.toLocaleString('es-AR');
    
    // Actualizar link de WhatsApp
    const mensaje = encodeURIComponent(`Hola, me gustaría confirmar mi pedido:\n\n${resumenProductos}\nTOTAL: $${total.toLocaleString('es-AR')}\n\nGracias.`);
    document.getElementById('whatsappBtn').href = `https://wa.me/541166485606?text=${mensaje}`;
}

function increaseQty(id) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity++;
        updateCartCount();
        updateCartDisplay();
    }
}

function decreaseQty(id) {
    const item = cart.find(i => i.id === id);
    if (item && item.quantity > 1) {
        item.quantity--;
        updateCartCount();
        updateCartDisplay();
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartCount();
    updateCartDisplay();
}

// Cart modal
document.querySelector('.cart-icon').addEventListener('click', function(e) {
    e.preventDefault();
    const modal = document.getElementById('cartModal');
    modal.style.display = 'block';
    updateCartDisplay();
});

document.querySelector('.close-btn').addEventListener('click', function() {
    document.getElementById('cartModal').style.display = 'none';
});

window.addEventListener('click', function(event) {
    const modal = document.getElementById('cartModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-btn" onclick="openCart()">Ir al carrito</button>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function showSimpleNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function openCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.style.display = 'block';
    updateCartDisplay();
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Login functionality
document.querySelector('.login-link').addEventListener('click', function(e) {
    e.preventDefault();
    const user = prompt('Ingresa tu usuario:');
    if (user) {
        showNotification(`¡Bienvenido ${user}!`);
    }
});

// Search functionality
document.querySelector('.search-box').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const query = this.value.trim().toLowerCase();
        if (query === '') {
            cargarProductos();
            return;
        }
        buscarProductos(query);
        this.value = '';
    }
});

// Función para calcular similitud entre dos strings (distancia de Levenshtein)
function calcularSimilitud(str1, str2) {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
    
    const len1 = str1.length;
    const len2 = str2.length;
    const matriz = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(0));
    
    for (let i = 0; i <= len1; i++) matriz[0][i] = i;
    for (let j = 0; j <= len2; j++) matriz[j][0] = j;
    
    for (let j = 1; j <= len2; j++) {
        for (let i = 1; i <= len1; i++) {
            if (str1[i - 1] === str2[j - 1]) {
                matriz[j][i] = matriz[j - 1][i - 1];
            } else {
                matriz[j][i] = Math.min(
                    matriz[j][i - 1] + 1,
                    matriz[j - 1][i] + 1,
                    matriz[j - 1][i - 1] + 1
                );
            }
        }
    }
    
    const distancia = matriz[len2][len1];
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 100 : ((maxLen - distancia) / maxLen) * 100;
}

// Función para búsqueda fuzzy (tolerante a errores tipográficos)
function coincideConTolerancia(texto, query, umbral = 70) {
    // Primero intenta coincidencia exacta
    if (texto.toLowerCase().includes(query.toLowerCase())) {
        return true;
    }
    
    // Luego intenta coincidencia aproximada por palabras
    const palabrasTexto = texto.toLowerCase().split(/\s+/);
    const palabrasQuery = query.toLowerCase().split(/\s+/);
    
    for (const pq of palabrasQuery) {
        for (const pt of palabrasTexto) {
            if (calcularSimilitud(pt, pq) >= umbral) {
                return true;
            }
        }
    }
    
    return false;
}

// Función para buscar productos
async function buscarProductos(query) {
    try {
        const res = await fetch(`${API_URL}/productos`);
        const allProducts = await res.json();
        
        // Usar búsqueda con tolerancia a errores tipográficos
        const resultados = allProducts.filter(p => 
            coincideConTolerancia(p.nombre, query) || 
            coincideConTolerancia(p.descripcion, query) ||
            coincideConTolerancia(p.categoria, query) ||
            coincideConTolerancia(p.coleccion, query)
        );
        
        // Usar el contenedor de novedades para mostrar resultados de búsqueda
        const contenedor = document.getElementById('productosNovedades');
        
        if (!contenedor) {
            showSimpleNotification('Error: No se encontró el contenedor de productos');
            return;
        }
        
        if (resultados.length === 0) {
            contenedor.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; padding: 40px 20px; font-size: 16px; color: #666;">No se encontraron productos para "' + query + '"</p>';
            showSimpleNotification('No se encontraron resultados');
        } else {
            renderizarProductos(resultados, 'productosNovedades');
            showSimpleNotification(`Se encontraron ${resultados.length} producto(s)`);
            
            // Scroll a la sección de productos
            document.getElementById('stock').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error en búsqueda:', error);
        showSimpleNotification('Error en la búsqueda');
    }
}

// Cargar categorías desde la API
async function cargarCategorias() {
    try {
        const res = await fetch(`${API_URL}/categorias`);
        const categorias = await res.json();
        renderizarCategorias(categorias);
    } catch (error) {
        console.error('Error cargando categorías:', error);
    }
}

function renderizarCategorias(categorias) {
    const contenedor = document.getElementById('categoriasContainer');
    contenedor.innerHTML = '';
    
    categorias.forEach(categoria => {
        const card = document.createElement('div');
        card.className = 'category-card-large';
        
        const imagenSrc = categoria.imagen && categoria.imagen.trim() !== '' 
            ? categoria.imagen 
            : `https://via.placeholder.com/400x300?text=${encodeURIComponent(categoria.nombre)}`;
        
        card.innerHTML = `
            <div class="category-image">
                <img src="${imagenSrc}" alt="${categoria.nombre}" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(categoria.nombre)}'">
            </div>
            <div class="category-info">
                <h3>${categoria.nombre}</h3>
                <p>${categoria.descripcion}</p>
            </div>
        `;
        
        card.addEventListener('click', () => {
            filtrarPorCategoria(categoria.nombre);
        });
        
        contenedor.appendChild(card);
    });
}

// Cargar colecciones desde la API
async function cargarColecciones() {
    try {
        const res = await fetch(`${API_URL}/colecciones`);
        const colecciones = await res.json();
        renderizarColecciones(colecciones);
    } catch (error) {
        console.error('Error cargando colecciones:', error);
    }
}

function renderizarColecciones(colecciones) {
    const contenedor = document.getElementById('coleccionesContainer');
    contenedor.innerHTML = '';
    
    colecciones.forEach(coleccion => {
        const card = document.createElement('div');
        card.className = 'collection-card';
        
        const imagenSrc = coleccion.imagen && coleccion.imagen.trim() !== '' 
            ? coleccion.imagen 
            : `https://via.placeholder.com/400x300?text=${encodeURIComponent(coleccion.nombre)}`;
        
        card.innerHTML = `
            <div class="collection-image">
                <img src="${imagenSrc}" alt="${coleccion.nombre}" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(coleccion.nombre)}'">
            </div>
            <div class="collection-info">
                <h3>${coleccion.nombre}</h3>
                <p>${coleccion.descripcion}</p>
            </div>
        `;
        
        card.addEventListener('click', () => {
            filtrarPorColeccion(coleccion.nombre);
        });
        
        contenedor.appendChild(card);
    });
}

// Filtrar productos por categoría
async function filtrarPorCategoria(categoria) {
    try {
        const res = await fetch(`${API_URL}/productos`);
        const productos = await res.json();
        const filtrados = productos.filter(p => p.categoria === categoria);
        
        renderizarProductos(filtrados, 'productosNovedades');
        
        // Scroll a la sección de productos
        document.getElementById('stock').scrollIntoView({ behavior: 'smooth' });
        
        showSimpleNotification(`${filtrados.length} productos encontrados en ${categoria}`);
    } catch (error) {
        console.error('Error filtrando por categoría:', error);
    }
}

// Filtrar productos por colección
async function filtrarPorColeccion(coleccion) {
    try {
        const res = await fetch(`${API_URL}/productos`);
        const productos = await res.json();
        const filtrados = productos.filter(p => p.coleccion === coleccion);
        
        renderizarProductos(filtrados, 'productosNovedades');
        
        // Scroll a la sección de productos
        document.getElementById('stock').scrollIntoView({ behavior: 'smooth' });
        
        showSimpleNotification(`${filtrados.length} productos encontrados en ${coleccion}`);
    } catch (error) {
        console.error('Error filtrando por colección:', error);
    }
}

// Poblar menú desplegable de colecciones
async function poblarMenuColecciones() {
    try {
        const res = await fetch(`${API_URL}/colecciones`);
        const colecciones = await res.json();
        const menu = document.getElementById('coleccionesMenu');
        menu.innerHTML = '';
        
        colecciones.forEach(coleccion => {
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = coleccion.nombre;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                filtrarPorColeccion(coleccion.nombre);
            });
            menu.appendChild(link);
        });
    } catch (error) {
        console.error('Error cargando colecciones para el menú:', error);
    }
}

// Poblar menú desplegable de catálogos (categorías)
async function poblarMenuCatalogos() {
    try {
        const res = await fetch(`${API_URL}/categorias`);
        const categorias = await res.json();
        const menu = document.getElementById('catalogosMenu');
        menu.innerHTML = '';
        
        categorias.forEach(categoria => {
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = categoria.nombre;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                filtrarPorCategoria(categoria.nombre);
            });
            menu.appendChild(link);
        });
    } catch (error) {
        console.error('Error cargando categorías para el menú:', error);
    }
}

console.log('FORMA - Sitio web cargado correctamente');

// ===== CAROUSEL =====
let currentCarouselSlide = 0;
let carouselSlides = [];

async function cargarCarousel() {
    try {
        const res = await fetch(`${API_URL}/carousel`);
        carouselSlides = await res.json();
        
        // Filtrar solo los slides activos
        carouselSlides = carouselSlides.filter(s => s.activo);
        
        if (carouselSlides.length === 0) return;
        
        renderizarCarousel();
    } catch (error) {
        console.error('Error cargando carousel:', error);
    }
}

function renderizarCarousel() {
    const container = document.getElementById('carouselContainer');
    const dotsContainer = document.getElementById('carouselDots');
    
    container.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    // Agregar slide duplicado al final al inicio (para efecto infinito)
    if (carouselSlides.length > 0) {
        const ultimoSlide = carouselSlides[carouselSlides.length - 1];
        const slideDuplicado = document.createElement('div');
        slideDuplicado.className = 'carousel-slide';
        
        let mediaHTML = '';
        if (ultimoSlide.tipo_media === 'imagen' && ultimoSlide.media_url) {
            mediaHTML = `<img src="${ultimoSlide.media_url}" alt="${ultimoSlide.titulo}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else if (ultimoSlide.tipo_media === 'video' && ultimoSlide.media_url) {
            if (ultimoSlide.media_url.includes('youtube.com') || ultimoSlide.media_url.includes('youtu.be')) {
                const videoId = extractYoutubeId(ultimoSlide.media_url);
                mediaHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="position: absolute; top: 0; left: 0;"></iframe>`;
            } else {
                mediaHTML = `<video width="100%" height="100%" autoplay muted loop style="object-fit: cover;"><source src="${ultimoSlide.media_url}"></video>`;
            }
        }
        
        slideDuplicado.innerHTML = `
            <div class="slide-content">
                <h2>${ultimoSlide.titulo}</h2>
                <p>${ultimoSlide.descripcion}</p>
            </div>
            <div class="slide-background" style="position: relative; width: 100%; height: 100%;">
                ${mediaHTML}
                <div class="slide-overlay"></div>
                <button class="btn btn-primary" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 15;" onclick="window.location.href='${ultimoSlide.boton_link}'">${ultimoSlide.boton_texto}</button>
            </div>
            <div class="slide-content">
                <h2>${ultimoSlide.titulo}</h2>
                <p>${ultimoSlide.descripcion}</p>
            </div>
        `;
        
        container.appendChild(slideDuplicado);
    }
    
    // Agregar todos los slides originales
    carouselSlides.forEach((slide, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
        
        let mediaHTML = '';
        if (slide.tipo_media === 'imagen' && slide.media_url) {
            mediaHTML = `<img src="${slide.media_url}" alt="${slide.titulo}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else if (slide.tipo_media === 'video' && slide.media_url) {
            if (slide.media_url.includes('youtube.com') || slide.media_url.includes('youtu.be')) {
                const videoId = extractYoutubeId(slide.media_url);
                mediaHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="position: absolute; top: 0; left: 0;"></iframe>`;
            } else {
                mediaHTML = `<video width="100%" height="100%" autoplay muted loop style="object-fit: cover;"><source src="${slide.media_url}"></video>`;
            }
        }
        
        // Detectar móvil
        const isMobile = window.innerWidth <= 600;
        if (isMobile) {
            slideDiv.innerHTML = `
                <div class="slide-content">
                    <h2>${slide.titulo}</h2>
                    <p>${slide.descripcion}</p>
                </div>
                <div class="slide-background" style="position: relative; width: 100%; height: 100%;">
                    ${mediaHTML}
                    <div class="slide-overlay"></div>
                    <button class="btn btn-primary" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 15;" onclick="window.location.href='${slide.boton_link}'">${slide.boton_texto}</button>
                </div>
                <div class="slide-content">
                    <h2>${slide.titulo}</h2>
                    <p>${slide.descripcion}</p>
                </div>
            `;
        } else {
            slideDiv.innerHTML = `
                <div class="slide-content">
                    <h2>${slide.titulo}</h2>
                    <p>${slide.descripcion}</p>
                </div>
                <div class="slide-background" style="position: relative; width: 100%; height: 100%;">
                    ${mediaHTML}
                    <div class="slide-overlay"></div>
                    <button class="btn btn-primary" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 15;" onclick="window.location.href='${slide.boton_link}'">${slide.boton_texto}</button>
                </div>
                <div class="slide-content">
                    <h2>${slide.titulo}</h2>
                    <p>${slide.descripcion}</p>
                </div>
            `;
        }
        
        container.appendChild(slideDiv);
        
        // Crear dot
        const dot = document.createElement('span');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => mostrarSlideCarousel(index + 1);
        dotsContainer.appendChild(dot);
    });
    
    // Agregar primer slide duplicado al final (para efecto infinito)
    if (carouselSlides.length > 0) {
        const primerSlide = carouselSlides[0];
        const slideDuplicado = document.createElement('div');
        slideDuplicado.className = 'carousel-slide';
        
        let mediaHTML = '';
        if (primerSlide.tipo_media === 'imagen' && primerSlide.media_url) {
            mediaHTML = `<img src="${primerSlide.media_url}" alt="${primerSlide.titulo}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else if (primerSlide.tipo_media === 'video' && primerSlide.media_url) {
            if (primerSlide.media_url.includes('youtube.com') || primerSlide.media_url.includes('youtu.be')) {
                const videoId = extractYoutubeId(primerSlide.media_url);
                mediaHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="position: absolute; top: 0; left: 0;"></iframe>`;
            } else {
                mediaHTML = `<video width="100%" height="100%" autoplay muted loop style="object-fit: cover;"><source src="${primerSlide.media_url}"></video>`;
            }
        }
        
        slideDuplicado.innerHTML = `
            <div class="slide-content">
                <h2>${primerSlide.titulo}</h2>
                <p>${primerSlide.descripcion}</p>
            </div>
            <div class="slide-background" style="position: relative; width: 100%; height: 100%;">
                ${mediaHTML}
                <div class="slide-overlay"></div>
                <button class="btn btn-primary" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 15;" onclick="window.location.href='${primerSlide.boton_link}'">${primerSlide.boton_texto}</button>
            </div>
            <div class="slide-content">
                <h2>${primerSlide.titulo}</h2>
                <p>${primerSlide.descripcion}</p>
            </div>
        `;
        
        container.appendChild(slideDuplicado);
    }
}

function mostrarSlideCarousel(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const totalSlides = slides.length;
    const totalDots = dots.length;
    
    // Ajustar índice con efecto infinito
    if (index >= totalSlides) {
        currentCarouselSlide = 1;
    } else if (index < 0) {
        currentCarouselSlide = totalSlides - 2;
    } else {
        currentCarouselSlide = index;
    }

    // Remover clase active de todos
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Agregar clase active al slide actual
    if (slides[currentCarouselSlide]) {
        slides[currentCarouselSlide].classList.add('active');
    }

    // Calcular el índice real del slide (ignorando duplicados)
    let realIndex = currentCarouselSlide - 1;
    if (currentCarouselSlide === 0) realIndex = dots.length - 1;
    if (currentCarouselSlide === slides.length - 1) realIndex = 0;

    // Agregar clase active al dot correspondiente
    if (realIndex >= 0 && realIndex < totalDots && dots[realIndex]) {
        dots[realIndex].classList.add('active');
    }
}

function changeSlide(n) {
    mostrarSlideCarousel(currentCarouselSlide + n);
}

// Helper para extraer ID de YouTube
function extractYoutubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
}

// Cargar productos al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarBannerMessage();
    cargarCarousel();
    cargarProductos();
    cargarCategorias();
    cargarColecciones();
    poblarMenuColecciones();
    poblarMenuCatalogos();
    
    // Cerrar modal de producto
    const closeBtn = document.querySelector('.close-btn');
    const productModal = document.getElementById('productModal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            productModal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', function(event) {
        if (event.target == productModal) {
            productModal.style.display = 'none';
        }
    });
});

// Dropdown menu con delay de cierre mejorado
let dropdownTimeout = null;

document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const menu = dropdown.querySelector('.dropdown-menu');
    
    dropdown.addEventListener('mouseenter', function() {
        // Cancelar el timeout si existe
        if (dropdownTimeout) {
            clearTimeout(dropdownTimeout);
            dropdownTimeout = null;
        }
        // Agregar clase para mantener visible
        dropdown.classList.add('dropdown-open');
    });
    
    dropdown.addEventListener('mouseleave', function() {
        // Esperar medio segundo antes de cerrar
        dropdownTimeout = setTimeout(() => {
            dropdown.classList.remove('dropdown-open');
        }, 500);
    });
});

// Cerrar dropdown al hacer clic en un enlace
document.querySelectorAll('.dropdown-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
        const dropdown = this.closest('.nav-dropdown');
        if (dropdown) {
            dropdown.classList.remove('dropdown-open');
        }
        if (dropdownTimeout) {
            clearTimeout(dropdownTimeout);
        }
    });
});
