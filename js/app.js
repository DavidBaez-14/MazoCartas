(function(){
  // Claves y selectores
  var CLAVE_STORAGE = 'mazo_cartas_datos';
  var URL_ENDPOINT = 'https://carlosreneas.github.io/endpoints/cartas.json';

  var cuerpoTabla = null;
  var formulario = null;
  var btnLimpiar = null;
  var rejilla = null;

  // Estado en memoria
  var arregloCartas = [];

  // Utilidades de almacenamiento
  function guardarEnLocalStorage(){
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(arregloCartas));
    } catch (e) {
      console.error('Error guardando en localStorage', e);
    }
  }

  function obtenerDeLocalStorage(){
    try {
      var texto = localStorage.getItem(CLAVE_STORAGE);
      if(texto){
        var datos = JSON.parse(texto);
        if(Object.prototype.toString.call(datos) === '[object Array]'){
          return datos;
        }
      }
    } catch (e) {
      console.warn('No se pudo leer localStorage, se continuará con arreglo vacío.');
    }
    return null;
  }

  // Renderizado
  function ordenarPorCantidadDesc(){
    arregloCartas.sort(function(a,b){
      var ca = parseInt(a.cantidad || a.valor || 0, 10);
      var cb = parseInt(b.cantidad || b.valor || 0, 10);
      return cb - ca;
    });
  }

  function crearFila(indice, item){
    var tr = document.createElement('tr');

    var th = document.createElement('th');
    th.scope = 'row';
    th.textContent = String(indice + 1);


    var tdCarta = document.createElement('td');
    tdCarta.textContent = item.carta;

    var cantidad = item.cantidad != null ? item.cantidad : item.valor;
    if(cantidad == null){ cantidad = 0; }
    var tdCantidad = document.createElement('td');
    tdCantidad.textContent = String(cantidad);

    tr.appendChild(th);
    tr.appendChild(tdNumero);
    tr.appendChild(tdCarta);
    tr.appendChild(tdCantidad);

    // Columna de acción (Eliminar)
    var tdAccion = document.createElement('td');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'boton-eliminar';
    btn.textContent = 'Eliminar';
    btn.addEventListener('click', function(){
      eliminarCartaPorIndice(indice);
    });
    tdAccion.appendChild(btn);
    tr.appendChild(tdAccion);

    return tr;
  }

  function renderizarTabla(){
    if(!cuerpoTabla){ return; }
    
    while(cuerpoTabla.firstChild){
      cuerpoTabla.removeChild(cuerpoTabla.firstChild);
    }

    for(var i=0; i<arregloCartas.length; i++){
      cuerpoTabla.appendChild(crearFila(i, arregloCartas[i]));
    }
  }

  // Buscar por número
  function buscarIndicePorNumero(numero){
    for(var i=0; i<arregloCartas.length; i++){
      if(String(arregloCartas[i].numero) === String(numero)){
        return i;
      }
    }
    return -1;
  }

  function mapNumeroANombreCarta(numero){
    var n = parseInt(numero, 10);
    if(n === 1) return 'As';
    if(n === 11) return 'Jota';
    if(n === 12) return 'Reina';
    if(n === 13) return 'Rey';
    return String(numero);
  }

  function incrementarCantidadPorNumero(numero){
    var idx = buscarIndicePorNumero(numero);
    if(idx >= 0){
      var actual = arregloCartas[idx];
      var cant = parseInt(actual.cantidad, 10) || 0;
      actual.cantidad = cant + 1;
    } else {
      arregloCartas.push({
        numero: String(numero),
        carta: mapNumeroANombreCarta(numero),
        cantidad: 1
      });
      // Queda al final por push
    }
    guardarEnLocalStorage();
    renderizarTabla();
    resaltarFilaPorNumero(numero);
  }

  function resaltarFilaPorNumero(numero){
    var idx = buscarIndicePorNumero(numero);
    if(idx < 0) return;
    var filas = cuerpoTabla ? cuerpoTabla.querySelectorAll('tr') : [];
    if(idx < filas.length){
      var fila = filas[idx];
      if(!fila) return;
      fila.classList.remove('fila-resaltada');
      // forzar reflow para reiniciar la animación
      void fila.offsetWidth;
      fila.classList.add('fila-resaltada');
    }
  }

  function manejarClickCarta(evento){
    var boton = evento.currentTarget;
    var numero = boton.getAttribute('data-numero');
    if(numero){
      incrementarCantidadPorNumero(numero);
    }
  }

  function registrarClicksCartas(){
    rejilla = document.getElementById('rejilla-cartas');
    if(!rejilla) return;
    var botones = rejilla.querySelectorAll('.carta-boton');
    for(var i=0; i<botones.length; i++){
      var btn = botones[i];
      // Si no tuviera data-numero, intentar deducirlo del src
      var num = btn.getAttribute('data-numero');
      if(!num){
        var img = btn.querySelector('img');
        if(img && img.src){
          var m = img.src.match(/(\d+)\.png$/);
          if(m){ btn.setAttribute('data-numero', m[1]); }
        }
      }
      btn.addEventListener('click', manejarClickCarta);
    }
  }

  function eliminarCartaPorIndice(indice){
    if(indice >= 0 && indice < arregloCartas.length){
      arregloCartas.splice(indice, 1);
      guardarEnLocalStorage();
      renderizarTabla();
    }
  }

  // Carga inicial
  function cargarDatosIniciales(callback){
    var guardados = obtenerDeLocalStorage();
    if(guardados && guardados.length){
      arregloCartas = normalizarEstructura(guardados);
      if(typeof callback === 'function'){ callback(); }
      return;
    }

    // Si no hay datos en localStorage, obtener del endpoint
    fetch(URL_ENDPOINT)
      .then(function(resp){ return resp.json(); })
      .then(function(json){
        if(json && json.data){
          // El endpoint trae {numero, carta, valor}. Mapeamos "valor" a "cantidad".
          arregloCartas = normalizarEstructura(json.data);
          guardarEnLocalStorage();
          if(typeof callback === 'function'){ callback(); }
        } else {
          arregloCartas = [];
          if(typeof callback === 'function'){ callback(); }
        }
      })
      .catch(function(){
        // En caso de fallo de red, continuar vacío
        arregloCartas = [];
        if(typeof callback === 'function'){ callback(); }
      });
  }

  function normalizarEstructura(lista){
    var salida = [];
    for(var i=0; i<lista.length; i++){
      var it = lista[i] || {};
      var cantidad = it.cantidad != null ? it.cantidad : it.valor;
      if(cantidad == null){ cantidad = 0; }
      salida.push({
        numero: String(it.numero != null ? it.numero : ''),
        carta: String(it.carta != null ? it.carta : ''),
        cantidad: parseInt(cantidad, 10) || 0
      });
    }
    return salida;
  }

  // Manejo del formulario
  function manejarEnvioFormulario(evento){
    evento.preventDefault();
    var numero = document.getElementById('numero').value;
    var carta = document.getElementById('carta').value;
    var cantidad = document.getElementById('cantidad').value;

    var nuevo = {
      numero: String(numero),
      carta: String(carta),
      cantidad: parseInt(cantidad, 10) || 0
    };

    agregarCartaAlArreglo(nuevo);
    formulario.reset();
    document.getElementById('numero').focus();
  }

  function agregarCartaAlArreglo(item){
    arregloCartas.push(item);
    guardarEnLocalStorage();
    renderizarTabla();
  }

  function limpiarFormulario(){
    if(formulario){ formulario.reset(); }
  }

  // Inicialización
  function iniciar(){
    cuerpoTabla = document.getElementById('cuerpo-tabla');
    formulario = document.getElementById('formulario-cartas');
    btnLimpiar = document.getElementById('btn-limpiar');

    if(formulario){
      formulario.addEventListener('submit', manejarEnvioFormulario);
    }
    if(btnLimpiar){
      btnLimpiar.addEventListener('click', limpiarFormulario);
    }

    cargarDatosIniciales(function(){
      renderizarTabla();
      registrarClicksCartas();
      
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
