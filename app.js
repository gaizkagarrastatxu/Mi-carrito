class Carrito {
// es el método que inicializa el estado del carrito, recorre la lista y se asegura de que el precio sea numérico
  //Además inicializa la cantidad en 0 y el subtotal también
    constructor(productos, moneda = "€") {
    this.productos = productos;
    this.moneda = moneda;
    for (const producto of productos){
        producto.price = Number(producto.price);
        producto.quantity = 0;
        producto.subtotal = 0;
    }
    }

// Es para hacer una búsqueda rápida. Usa el .find para rastrear productos y que coincidan con el SKU que le pasamos

obtenerInfoProducto(sku) {
    return this.productos.find(producto => producto.SKU === sku);
  }

//Modifica la cantidad de un artículo buscándolo por su SKU.
//Utiliza Math.max para que no se puedan introducir cantidades negativas.

actualizarUnidades (sku,unidades){
    const producto = this.obtenerInfoProducto(sku);
    producto.quantity = Math.max(0, unidades);
    producto.subtotal = Number ((producto.price * producto.quantity).toFixed(2));

}

// Prepara los datos finales para el resumen de la compra.
// Filtra los productos con cantidad mayor que 0, suma sus subtotales y
// devuelve un objeto con la lista de productos, el total y la moneda.
obtenerCarrito(){
    const productos = this.productos.filter(producto => producto.quantity > 0);
    let total = 0;
    for (const producto of productos) total += producto.subtotal;
    return {productos, total: Number(total.toFixed(2)), currency: this.moneda};
}
}
// Instancia del carrito; se crea en iniciar() cuando llegan los datos de la API
let carrito;
 
// Referencias a los elementos del HTML que vamos a rellenar.
const tabla = document.querySelector("#productos");
const resumen = document.querySelector("#resumen");
const total = document.querySelector("#total");
const estado = document.querySelector("#estado");

// Da formato a un importe: dos decimales seguidos de la moneda (ej. "3.50 €")

function dinero(numero){
    return numero.toFixed(2) + " " + carrito.moneda;
}

// Dibuja toda la interfaz: vacía la tabla y el resumen, y los vuelve a construir.
// Cada fila de la tabla incluye título, referencia, desplegable de cantidad,
// precio y subtotal. Después rellena el resumen (solo productos con unidades)
// y el total. Se llama de nuevo tras cada cambio de cantidad.
function mostrar(){
    tabla.replaceChildren();
    resumen.replaceChildren();

    for (const producto of carrito.productos) {
        const fila = document.createElement("tr");
        fila.innerHTML = `
      <td><strong></strong><small></small></td>
      <td class="cantidad">
        <select class="selector-cantidad" aria-label="Cantidad del producto">
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
      </td>
      <td class="precio"></td>
      <td class="subtotal"></td>
    `;
    
    fila.querySelector("strong").textContent = producto.title;
    fila.querySelector("small").textContent = "REF: " + producto.SKU;

    // Asignamos el valor actual al desplegable
    const select = fila.querySelector(".selector-cantidad");
    select.value = producto.quantity;

    // Al cambiar el desplegable, actualizamos directamente la cantidad
    select.onchange = (e) => cambiarCantidadDirecta(producto.SKU, Number(e.target.value));

    fila.querySelector(".precio").textContent = dinero(producto.price);
    fila.querySelector(".subtotal").textContent = dinero(producto.subtotal);

    tabla.append(fila);
    }

    // Una línea por cada producto con al menos una unidad. 
    const datos = carrito.obtenerCarrito();
    for (const producto of datos.productos){
        const li = document.createElement("li");
        li.textContent = `${producto.quantity} × ${producto.title}: ${dinero(producto.subtotal)}`;
        resumen.append(li);
    }
    total.textContent = dinero(datos.total);

    }

    // Actualiza las unidades según la opción elegida en el desplegable
    function cambiarCantidadDirecta(sku, cantidadNueva){
        carrito.actualizarUnidades(sku,cantidadNueva);
        mostrar();
        estado.textContent = `Cantidad seleccionada correctamente.`;
    }
    // Dirección del servicio que devuelve el catálogo de productos.
    const URL_API = "api.php";

    // Utiliza programación asíncrona (async/await con dos esperas: una para el fetch(URL_API) y otra para el respuesta.json())
    async function iniciar (){
        try{
            const respuesta = await fetch(URL_API);
            if (!respuesta.ok) throw new Error ("HTTP " + respuesta.status);
            const datos = await respuesta.json();
            carrito = new Carrito (datos.products, datos.currency);
            mostrar();
            estado.textContent = "Catálogo cargado. Selecciona las unidades en el desplegable.";
        } catch (error) {
            estado.textContent = "No se pudieron cargar los productos: " + error.message;
        }
    }

iniciar();