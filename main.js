/* ==========================================================================
   Sociología · Unidad 1 — Guía digital de aprendizaje
   main.js · Toda la lógica interactiva del sitio

   BLOQUES
   -------------------------------------------------------------------------
   [1] Base            · año, cabecera, menú móvil, barra de progreso,
                         revelado al scroll, sección activa, subrayados
   [2] Línea de tiempo · Módulo 3   → línea de tiempo interactiva
   [3] Acordeones      · Módulo 5   → corrientes sociológicas
   [4] Quiz            · Evaluación → validación y puntaje
   [5] Fichas          · Equipo     → volteo de tarjetas
   [6] Extras          · avisos, volver arriba, contadores, copiar,
                         visor de imágenes, quiz desplegable, confeti
   [7] Tarjetas        · inclinación 3D, brillo y respuesta al toque
   ========================================================================== */

(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     ARRANQUE · la página siempre empieza arriba
     El navegador guarda la posición del scroll al recargar. Lo desactivamos
     para que la guía siempre abra en la portada.
     ---------------------------------------------------------------------- */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  window.addEventListener('load', function () {
    // Si la persona llegó con un enlace directo (#modulo-3) se respeta
    if (!window.location.hash) window.scrollTo(0, 0);
  });

  /* ======================================================================
     [1] BASE
     ====================================================================== */

  document.addEventListener('DOMContentLoaded', function () {

    /* --- Año dinámico en el pie ---------------------------------------- */
    const anio = document.getElementById('anio');
    if (anio) anio.textContent = new Date().getFullYear();

    /* --- Cabecera compacta al hacer scroll ------------------------------ */
    const cabecera = document.getElementById('cabecera');

    /* --- Barra de progreso de lectura ----------------------------------- */
    const barra = document.getElementById('barra-progreso');

    function alDesplazar() {
      const y = window.scrollY;

      if (cabecera) cabecera.classList.toggle('compacta', y > 24);

      if (barra) {
        const alto = document.documentElement.scrollHeight - window.innerHeight;
        const avance = alto > 0 ? y / alto : 0;
        barra.style.transform = 'scaleX(' + avance + ')';
      }
    }

    // requestAnimationFrame para no saturar el evento de scroll
    let esperando = false;
    window.addEventListener('scroll', function () {
      if (esperando) return;
      esperando = true;
      window.requestAnimationFrame(function () {
        alDesplazar();
        esperando = false;
      });
    }, { passive: true });
    alDesplazar();

    /* --- Menú móvil ------------------------------------------------------ */
    const btnMenu     = document.getElementById('btn-menu');
    const menuMovil   = document.getElementById('menu-movil');
    const iconoAbrir  = document.getElementById('icono-abrir');
    const iconoCerrar = document.getElementById('icono-cerrar');

    function alternarMenu(abrir) {
      if (!menuMovil) return;
      const visible = typeof abrir === 'boolean'
        ? abrir
        : !menuMovil.classList.contains('abierto');

      menuMovil.classList.toggle('abierto', visible);
      iconoAbrir.classList.toggle('hidden', visible);
      iconoCerrar.classList.toggle('hidden', !visible);
      btnMenu.setAttribute('aria-expanded', String(visible));
      btnMenu.setAttribute('aria-label', visible ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');

      // Con el menú desplegado se apartan los botones flotantes
      document.body.classList.toggle('menu-abierto', visible);

      // El menú vuelve a su inicio cada vez que se abre
      if (visible) menuMovil.scrollTop = 0;
    }

    if (btnMenu) {
      btnMenu.addEventListener('click', function () { alternarMenu(); });

      document.querySelectorAll('#menu-movil .menu-item').forEach(function (enlace) {
        enlace.addEventListener('click', function () { alternarMenu(false); });
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menuMovil.classList.contains('abierto')) {
          alternarMenu(false);
          btnMenu.focus();
        }
      });
    }

    /* --- Revelado de elementos al entrar en pantalla --------------------- */
    const revelables = document.querySelectorAll('.revelar');

    if ('IntersectionObserver' in window && revelables.length) {
      const observadorRevelar = new IntersectionObserver(function (entradas, obs) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add('visible');
          obs.unobserve(entrada.target);   // se anima una sola vez
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: .12 });

      revelables.forEach(function (el) { observadorRevelar.observe(el); });
    } else {
      revelables.forEach(function (el) { el.classList.add('visible'); });
    }

    /* --- Subrayados dibujados a mano ------------------------------------- */
    const subrayados = document.querySelectorAll('[data-subrayado]');

    if ('IntersectionObserver' in window && subrayados.length) {
      const observadorSubrayar = new IntersectionObserver(function (entradas, obs) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          setTimeout(function () { entrada.target.classList.add('pintado'); }, 500);
          obs.unobserve(entrada.target);
        });
      }, { threshold: .6 });

      subrayados.forEach(function (el) { observadorSubrayar.observe(el); });
    } else {
      subrayados.forEach(function (el) { el.classList.add('pintado'); });
    }

    /* --- Enlace activo según la sección visible -------------------------- */
    const enlacesNav = Array.prototype.slice.call(document.querySelectorAll('.nav-enlace'));
    const secciones  = enlacesNav
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    if ('IntersectionObserver' in window && secciones.length) {
      const observadorNav = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          enlacesNav.forEach(function (a) {
            a.classList.toggle('activo', a.getAttribute('href') === '#' + entrada.target.id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

      secciones.forEach(function (s) { observadorNav.observe(s); });
    }

    /* --- Imágenes que aún no existen ------------------------------------- */
    /* Mientras no subas los PNG a /assets/images, se muestra un marco
       punteado en su lugar en vez de un icono de imagen rota.               */
    document.querySelectorAll('[data-marco]').forEach(function (img) {
      function mostrarMarcoVacio() {
        const marco = img.parentElement.querySelector('[data-marco-vacio]');
        img.classList.add('hidden');
        if (marco) marco.classList.remove('hidden');
      }
      img.addEventListener('error', mostrarMarcoVacio);
      // Por si el error ocurrió antes de registrar el listener
      if (img.complete && img.naturalWidth === 0) mostrarMarcoVacio();
    });

    /* ======================================================================
       [2] LÍNEA DE TIEMPO INTERACTIVA · Módulo 3
       ====================================================================== */

    const lineaTiempo = document.getElementById('linea-tiempo');

    if (lineaTiempo) {
      const hitos   = Array.prototype.slice.call(lineaTiempo.querySelectorAll('.hito'));
      const paneles = hitos.map(function (h) { return document.getElementById(h.dataset.panel); });
      const avance  = document.getElementById('riel-avance');
      const btnPrev = document.getElementById('hito-anterior');
      const btnNext = document.getElementById('hito-siguiente');
      const contador= document.getElementById('hito-actual');

      let indiceActual = 0;

      function mostrarHito(indice, moverFoco) {
        indiceActual = Math.max(0, Math.min(indice, hitos.length - 1));

        hitos.forEach(function (hito, i) {
          const activo = i === indiceActual;
          hito.setAttribute('aria-selected', String(activo));
          hito.tabIndex = activo ? 0 : -1;

          const panel = paneles[i];
          panel.hidden = !activo;
          panel.classList.remove('animar');
          if (activo) {
            // Reinicia la animación de "pasar página"
            void panel.offsetWidth;
            panel.classList.add('animar');
          }
        });

        // Avance de la cuerda: del primer globo hasta el activo
        const porcentaje = hitos.length > 1
          ? (indiceActual / (hitos.length - 1)) * 100
          : 100;
        if (avance) avance.style.width = porcentaje + '%';

        if (contador) contador.textContent = indiceActual + 1;
        if (btnPrev)  btnPrev.disabled = indiceActual === 0;
        if (btnNext)  btnNext.disabled = indiceActual === hitos.length - 1;

        const activo = hitos[indiceActual];
        if (moverFoco) activo.focus();
        activo.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }

      // Clic en cada hito
      hitos.forEach(function (hito, i) {
        hito.addEventListener('click', function () { mostrarHito(i, false); });
      });

      // Navegación con teclado sobre el riel
      const riel = lineaTiempo.querySelector('[role="tablist"]');
      if (riel) {
        riel.addEventListener('keydown', function (e) {
          let destino = null;
          if (e.key === 'ArrowRight')     destino = indiceActual + 1;
          else if (e.key === 'ArrowLeft') destino = indiceActual - 1;
          else if (e.key === 'Home')      destino = 0;
          else if (e.key === 'End')       destino = hitos.length - 1;
          if (destino === null) return;
          e.preventDefault();
          mostrarHito(destino, true);
        });
      }

      if (btnPrev) btnPrev.addEventListener('click', function () { mostrarHito(indiceActual - 1, false); });
      if (btnNext) btnNext.addEventListener('click', function () { mostrarHito(indiceActual + 1, false); });

      mostrarHito(0, false);
    }

    /* ======================================================================
       [3] ACORDEONES DE CORRIENTES · Módulo 5
       ====================================================================== */

    const contenedorAcordeones = document.getElementById('acordeones');

    if (contenedorAcordeones) {
      const botones  = Array.prototype.slice.call(contenedorAcordeones.querySelectorAll('.acordeon-btn'));
      const btnTodos = document.getElementById('btn-acordeones');

      function alternarAcordeon(boton, abrir) {
        const tarjeta = boton.closest('.acordeon');
        const panel   = document.getElementById(boton.getAttribute('aria-controls'));
        const abierto = typeof abrir === 'boolean'
          ? abrir
          : boton.getAttribute('aria-expanded') !== 'true';

        boton.setAttribute('aria-expanded', String(abierto));
        tarjeta.classList.toggle('abierto', abierto);
        if (panel) {
          panel.dataset.abierto = String(abierto);   // dispara la animación del CSS
          panel.setAttribute('aria-hidden', String(!abierto));
        }
      }

      function actualizarBotonGeneral() {
        if (!btnTodos) return;
        const todasAbiertas = botones.every(function (b) {
          return b.getAttribute('aria-expanded') === 'true';
        });
        btnTodos.textContent = todasAbiertas ? 'Cerrar todas' : 'Abrir todas';
      }

      botones.forEach(function (boton) {
        boton.addEventListener('click', function () {
          alternarAcordeon(boton);
          actualizarBotonGeneral();
        });
      });

      if (btnTodos) {
        btnTodos.addEventListener('click', function () {
          // Si queda alguna cerrada, el botón abre todas; si no, las cierra
          const abrir = botones.some(function (b) {
            return b.getAttribute('aria-expanded') !== 'true';
          });
          botones.forEach(function (b) { alternarAcordeon(b, abrir); });
          actualizarBotonGeneral();
        });
      }

      // Estado inicial: todas cerradas
      botones.forEach(function (b) { alternarAcordeon(b, false); });
      actualizarBotonGeneral();
    }

    /* ======================================================================
       [4] QUIZ INTERACTIVO · Sección de evaluación
       ====================================================================== */

    const quizForm = document.getElementById('quiz-form');

    if (quizForm) {
      const preguntas    = Array.prototype.slice.call(quizForm.querySelectorAll('.quiz-pregunta'));
      const aviso        = document.getElementById('quiz-aviso');
      const btnEnviar    = document.getElementById('quiz-enviar');
      const btnReiniciar = document.getElementById('quiz-reiniciar');
      const resultado    = document.getElementById('quiz-resultado');
      const marcador     = document.getElementById('quiz-puntaje');
      const mensaje      = document.getElementById('quiz-mensaje');
      const emoji        = document.getElementById('quiz-emoji');
      const contadorResp = document.getElementById('quiz-respondidas');
      const barraAvance  = document.getElementById('quiz-avance');
      const rellenoAvance= document.getElementById('quiz-avance-relleno');

      /* Explicación que se muestra al corregir. La clave es la respuesta correcta. */
      const explicaciones = {
        '1b': 'La ciencia es fáctica porque describe los hechos tal y como son.',
        '2c': 'Comte acuñó el término sociología en 1838 para nombrar la nueva ciencia de la sociedad.',
        '3d': 'Los hechos sociales son modos de actuar, pensar y sentir externos al individuo que ejercen una fuerza coercitiva sobre él.',
        '4b': 'Spencer extrapoló la teoría darwinista a la sociología: la supervivencia del más apto.',
        '5a': 'La latencia es el mantenimiento de patrones: renovar la motivación de los individuos y las pautas culturales del sistema.'
      };

      /* Mensaje y emoji según el puntaje obtenido (índice 0 a 5) */
      const mensajes = [
        'Conviene repasar los módulos desde el principio antes de volver a intentarlo.',
        'Vas empezando. Revisa los módulos 1 y 2 y vuelve a probar.',
        'Buen arranque. Repasa los precursores y las corrientes para afinar.',
        'Vas bien. Te falta afinar un par de conceptos.',
        'Muy bien. Solo se te escapó una.',
        'Excelente. Dominas el contenido de la Unidad 1.'
      ];
      const emojis = ['📚', '📖', '🌱', '👏', '🌟', '🏆'];

      /* --- Avance en vivo mientras se responde -------------------------- */
      function actualizarAvance() {
        const respondidas = preguntas.filter(function (p) {
          return p.querySelector('input:checked');
        }).length;

        if (contadorResp)  contadorResp.textContent = respondidas;
        if (rellenoAvance) rellenoAvance.style.width = (respondidas / preguntas.length * 100) + '%';
        if (barraAvance)   barraAvance.setAttribute('aria-valuenow', respondidas);
      }

      quizForm.addEventListener('change', function (e) {
        if (e.target.matches('.quiz-radio')) {
          actualizarAvance();
          if (aviso) aviso.classList.add('hidden');
        }
      });

      /* --- Limpieza de estados ------------------------------------------ */
      function limpiarEstados() {
        quizForm.querySelectorAll('.quiz-opcion').forEach(function (op) {
          op.classList.remove('correcta', 'incorrecta');
        });
        quizForm.querySelectorAll('.quiz-explicacion').forEach(function (ex) {
          ex.classList.add('hidden');
          ex.textContent = '';
        });
        preguntas.forEach(function (p) { p.classList.remove('resuelta'); });
      }

      /* --- Corrección ---------------------------------------------------- */
      quizForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // 1 · Validar que estén todas respondidas
        const sinResponder = preguntas.filter(function (p) {
          return !p.querySelector('input:checked');
        });

        if (sinResponder.length > 0) {
          if (aviso) {
            aviso.textContent = sinResponder.length === 1
              ? 'Falta 1 pregunta por responder.'
              : 'Faltan ' + sinResponder.length + ' preguntas por responder.';
            aviso.classList.remove('hidden');
          }
          sinResponder[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        if (aviso) aviso.classList.add('hidden');
        limpiarEstados();

        // 2 · Calificar
        let puntaje = 0;

        preguntas.forEach(function (pregunta) {
          const correcta    = pregunta.dataset.correcta;
          const elegida     = pregunta.querySelector('input:checked');
          const explicacion = pregunta.querySelector('.quiz-explicacion');
          const acierto     = elegida.value === correcta;

          if (acierto) puntaje++;

          // Marca la opción elegida
          elegida.nextElementSibling.classList.add(acierto ? 'correcta' : 'incorrecta');

          // Si falló, resalta también cuál era la buena
          if (!acierto) {
            const buena = pregunta.querySelector('input[value="' + correcta + '"]');
            if (buena) buena.nextElementSibling.classList.add('correcta');
          }

          if (explicacion) {
            explicacion.textContent = (acierto ? '✅ Correcto. ' : '❌ Incorrecto. ') + explicaciones[correcta];
            explicacion.classList.remove('hidden');
          }

          pregunta.classList.add('resuelta');
          pregunta.querySelectorAll('input').forEach(function (i) { i.disabled = true; });
        });

        // 3 · Mostrar el resultado
        if (marcador) marcador.textContent = puntaje;
        if (mensaje)  mensaje.textContent  = mensajes[puntaje];
        if (emoji)    emoji.textContent    = emojis[puntaje];

        if (resultado) {
          resultado.classList.remove('hidden');
          resultado.classList.remove('animar');
          void resultado.offsetWidth;          // reinicia la animación
          resultado.classList.add('animar');
          resultado.focus();
          resultado.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        btnEnviar.classList.add('hidden');
        btnReiniciar.classList.remove('hidden');

        // Aviso para el bloque [6]: confeti y mensaje si el puntaje es perfecto
        document.dispatchEvent(new CustomEvent('quiz:resultado', { detail: { puntaje: puntaje } }));
      });

      /* --- Reinicio ------------------------------------------------------ */
      btnReiniciar.addEventListener('click', function () {
        quizForm.reset();
        limpiarEstados();
        quizForm.querySelectorAll('input').forEach(function (i) { i.disabled = false; });

        if (resultado) resultado.classList.add('hidden');
        if (aviso)     aviso.classList.add('hidden');
        btnReiniciar.classList.add('hidden');
        btnEnviar.classList.remove('hidden');

        actualizarAvance();
        quizForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      actualizarAvance();
    }

    /* ======================================================================
       [5] FICHAS DEL EQUIPO · volteo de tarjetas
       ====================================================================== */

    const fichas = Array.prototype.slice.call(document.querySelectorAll('[data-ficha]'));

    fichas.forEach(function (ficha) {
      const botones = Array.prototype.slice.call(ficha.querySelectorAll('[data-voltear]'));
      const abridor = ficha.querySelector('[aria-expanded]');

      function voltear(abrir) {
        const volteada = typeof abrir === 'boolean'
          ? abrir
          : !ficha.classList.contains('volteada');

        ficha.classList.toggle('volteada', volteada);
        if (abridor) abridor.setAttribute('aria-expanded', String(volteada));

        // El foco viaja a la cara que queda visible
        if (volteada) {
          const volver = ficha.querySelector('.ficha-reverso [data-voltear]');
          if (volver) setTimeout(function () { volver.focus(); }, 380);
        }
      }

      botones.forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          e.preventDefault();
          voltear();
        });
      });

      /* Respaldo: tocar cualquier parte de la ficha también la voltea.
         Así el volteo funciona aunque una capa decorativa quede encima
         del botón, y en móvil basta con tocar la tarjeta.               */
      ficha.addEventListener('click', function (e) {
        // No interferimos con enlaces ni con el botón de copiar correo
        if (e.target.closest('a, [data-copiar]')) return;
        voltear();
      });

      // Escape devuelve la ficha a su cara frontal
      ficha.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && ficha.classList.contains('volteada')) {
          voltear(false);
          if (abridor) abridor.focus();
        }
      });
    });

    /* ======================================================================
       [6] EXTRAS DE INTERACCIÓN
       ====================================================================== */

    /* ------------------------------------------------------------------
       6.1 · Avisos flotantes reutilizables
       ------------------------------------------------------------------ */
    const zonaAvisos = document.getElementById('avisos');

    function avisar(texto, icono) {
      if (!zonaAvisos) return;

      const aviso = document.createElement('div');
      aviso.className = 'aviso';
      aviso.innerHTML = '<span aria-hidden="true">' + (icono || '✅') + '</span><span></span>';
      aviso.lastElementChild.textContent = texto;
      zonaAvisos.appendChild(aviso);

      setTimeout(function () {
        aviso.classList.add('saliendo');
        setTimeout(function () { aviso.remove(); }, 320);
      }, 2600);
    }

    /* ------------------------------------------------------------------
       6.2 · Volver arriba, con anillo de progreso de lectura
       ------------------------------------------------------------------ */
    const btnSubir     = document.getElementById('subir');
    const anilloAvance = document.getElementById('anillo-avance');

    if (btnSubir) {
      const perimetro = 2 * Math.PI * 46;      // r = 46 en el SVG
      if (anilloAvance) {
        anilloAvance.style.strokeDasharray  = perimetro;
        anilloAvance.style.strokeDashoffset = perimetro;
      }

      function refrescarSubir() {
        const y     = window.scrollY;
        const alto  = document.documentElement.scrollHeight - window.innerHeight;
        const razon = alto > 0 ? Math.min(y / alto, 1) : 0;

        btnSubir.classList.toggle('visible', y > 600);
        if (anilloAvance) anilloAvance.style.strokeDashoffset = perimetro * (1 - razon);
      }

      let pendiente = false;
      window.addEventListener('scroll', function () {
        if (pendiente) return;
        pendiente = true;
        window.requestAnimationFrame(function () {
          refrescarSubir();
          pendiente = false;
        });
      }, { passive: true });
      refrescarSubir();

      btnSubir.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* ------------------------------------------------------------------
       6.3 · Contadores que suben al entrar en pantalla
       ------------------------------------------------------------------ */
    const contadores = document.querySelectorAll('[data-contador]');

    function animarContador(el) {
      const destino = parseInt(el.dataset.contador, 10) || 0;
      const duracion = 1100;
      const inicio = performance.now();

      function paso(ahora) {
        const t = Math.min((ahora - inicio) / duracion, 1);
        const suave = 1 - Math.pow(1 - t, 3);          // easing out cubic
        el.textContent = Math.round(destino * suave);
        if (t < 1) requestAnimationFrame(paso);
      }
      requestAnimationFrame(paso);
    }

    if ('IntersectionObserver' in window && contadores.length) {
      const obsContador = new IntersectionObserver(function (entradas, obs) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          animarContador(e.target);
          obs.unobserve(e.target);
        });
      }, { threshold: .6 });
      contadores.forEach(function (c) { obsContador.observe(c); });
    } else {
      contadores.forEach(function (c) { c.textContent = c.dataset.contador; });
    }

    /* ------------------------------------------------------------------
       6.4 · Copiar el correo al portapapeles
       ------------------------------------------------------------------ */
    document.querySelectorAll('[data-copiar]').forEach(function (boton) {
      boton.addEventListener('click', function (e) {
        e.stopPropagation();
        const texto = boton.dataset.copiar;

        function exito() {
          avisar('Correo copiado', '📋');
          const original = boton.textContent;
          boton.textContent = '¡Copiado!';
          setTimeout(function () { boton.textContent = original; }, 1800);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(texto).then(exito).catch(function () {
            avisar('No se pudo copiar: ' + texto, '⚠️');
          });
        } else {
          // Respaldo para navegadores antiguos o contexto sin https
          const campo = document.createElement('textarea');
          campo.value = texto;
          campo.style.position = 'fixed';
          campo.style.opacity = '0';
          document.body.appendChild(campo);
          campo.select();
          try { document.execCommand('copy'); exito(); }
          catch (err) { avisar('No se pudo copiar: ' + texto, '⚠️'); }
          campo.remove();
        }
      });
    });

    /* ------------------------------------------------------------------
       6.5 · Visor de imágenes de la línea de tiempo
       ------------------------------------------------------------------ */
    const visor       = document.getElementById('visor');
    const visorImg    = document.getElementById('visor-img');
    const visorPie    = document.getElementById('visor-pie');
    const visorCerrar = document.getElementById('visor-cerrar');
    let disparadorVisor = null;

    function abrirVisor(img) {
      if (!visor) return;
      disparadorVisor = img;
      visorImg.src = img.currentSrc || img.src;
      visorImg.alt = img.alt;

      const pie = img.closest('figure') ? img.closest('figure').querySelector('figcaption') : null;
      visorPie.textContent = pie ? pie.textContent.trim() : img.alt;

      visor.classList.add('abierto');
      document.body.style.overflow = 'hidden';
      visorCerrar.focus();
    }

    function cerrarVisor() {
      if (!visor) return;
      visor.classList.remove('abierto');
      document.body.style.overflow = '';
      if (disparadorVisor) disparadorVisor.focus();
    }

    document.querySelectorAll('[data-ampliable]').forEach(function (img) {
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Ampliar imagen: ' + img.alt);

      img.addEventListener('click', function () { abrirVisor(img); });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirVisor(img); }
      });
    });

    if (visor) {
      visorCerrar.addEventListener('click', cerrarVisor);
      visor.addEventListener('click', function (e) { if (e.target === visor) cerrarVisor(); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && visor.classList.contains('abierto')) cerrarVisor();
      });
    }

    /* ------------------------------------------------------------------
       6.6 · Quiz desplegable
       ------------------------------------------------------------------ */
    const quizAbrir    = document.getElementById('quiz-abrir');
    const quizCuerpo   = document.getElementById('quiz-cuerpo');
    const quizEtiqueta = document.getElementById('quiz-abrir-etiqueta');

    function desplegarQuiz(abrir) {
      if (!quizAbrir || !quizCuerpo) return;
      const visible = typeof abrir === 'boolean'
        ? abrir
        : quizAbrir.getAttribute('aria-expanded') !== 'true';

      quizAbrir.setAttribute('aria-expanded', String(visible));
      quizCuerpo.dataset.abierto = String(visible);
      if (quizEtiqueta) {
        quizEtiqueta.innerHTML = visible
          ? '<span aria-hidden="true">▲</span> Ocultar el quiz'
          : '<span aria-hidden="true">▶</span> Comenzar el quiz';
      }
      return visible;
    }

    if (quizAbrir) {
      quizAbrir.addEventListener('click', function () {
        const visible = desplegarQuiz();
        if (visible) {
          setTimeout(function () {
            const primera = document.querySelector('.quiz-pregunta');
            if (primera) primera.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 480);
        }
      });
      desplegarQuiz(false);
    }

    /* ------------------------------------------------------------------
       6.7 · Confeti para el puntaje perfecto
       ------------------------------------------------------------------ */
    const lienzo = document.getElementById('confeti');

    function lanzarConfeti() {
      if (!lienzo) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const ctx = lienzo.getContext('2d');
      lienzo.width  = window.innerWidth;
      lienzo.height = window.innerHeight;

      const colores = ['#E8B04B', '#E85B4E', '#6B9080', '#1B2A4A', '#F7F3E8'];
      const trozos = [];

      for (let i = 0; i < 140; i++) {
        trozos.push({
          x: Math.random() * lienzo.width,
          y: -20 - Math.random() * lienzo.height * .5,
          ancho: 6 + Math.random() * 7,
          alto: 9 + Math.random() * 9,
          color: colores[Math.floor(Math.random() * colores.length)],
          vy: 2.2 + Math.random() * 3.2,
          vx: -1.4 + Math.random() * 2.8,
          giro: Math.random() * Math.PI,
          vgiro: -0.12 + Math.random() * 0.24
        });
      }

      const finaliza = performance.now() + 4200;

      function dibujar(ahora) {
        ctx.clearRect(0, 0, lienzo.width, lienzo.height);

        trozos.forEach(function (t) {
          t.y += t.vy;
          t.x += t.vx;
          t.giro += t.vgiro;

          ctx.save();
          ctx.translate(t.x, t.y);
          ctx.rotate(t.giro);
          ctx.fillStyle = t.color;
          ctx.fillRect(-t.ancho / 2, -t.alto / 2, t.ancho, t.alto);
          ctx.restore();
        });

        if (ahora < finaliza) {
          requestAnimationFrame(dibujar);
        } else {
          ctx.clearRect(0, 0, lienzo.width, lienzo.height);
        }
      }
      requestAnimationFrame(dibujar);
    }

    // Se dispara solo cuando el quiz da 5 de 5
    document.addEventListener('quiz:resultado', function (e) {
      if (e.detail && e.detail.puntaje === 5) {
        lanzarConfeti();
        avisar('¡Puntaje perfecto! 5 de 5', '🏆');
      }
    });

    /* ------------------------------------------------------------------
       6.8 · Atajos de teclado
       ------------------------------------------------------------------ */
    document.addEventListener('keydown', function (e) {
      // Se ignoran los atajos mientras se escribe en un campo
      const foco = e.target;
      if (foco && foco.matches && foco.matches('input, textarea, select')) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const destinos = { '1': '#modulo-1', '2': '#modulo-2', '3': '#modulo-3',
                         '4': '#modulo-4', '5': '#modulo-5' };

      if (destinos[e.key]) {
        const seccion = document.querySelector(destinos[e.key]);
        if (seccion) { seccion.scrollIntoView({ behavior: 'smooth' }); avisar('Módulo ' + e.key, '📖'); }
      } else if (e.key.toLowerCase() === 'c') {
        const equipo = document.getElementById('equipo');
        if (equipo) { equipo.scrollIntoView({ behavior: 'smooth' }); avisar('Creadores', '👥'); }
      } else if (e.key.toLowerCase() === 'q') {
        const evaluacion = document.getElementById('evaluacion');
        if (evaluacion) {
          evaluacion.scrollIntoView({ behavior: 'smooth' });
          desplegarQuiz(true);
          avisar('Evaluación', '✏️');
        }
      }
    });

    /* ======================================================================
       [7] TARJETAS DINÁMICAS
       La tarjeta se inclina siguiendo al cursor, un reflejo acompaña el
       movimiento y se hunde al presionarla. En pantalla táctil, donde no
       hay cursor, responde con un pulso al tocarla.
       ====================================================================== */

    (function tarjetasDinamicas() {

      const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const hayCursor          = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

      const INCLINACION = 7;    // grados máximos de giro
      const LEVANTA     = 10;   // píxeles que sube la tarjeta

      /* --- Tarjetas normales ------------------------------------------- */
      const candidatas = document.querySelectorAll(
        '.tarjeta, .acordeon, .quiz-pregunta, .ficha-pendiente'
      );

      // Contenedores grandes: se quedan quietos, inclinarlos se vería mal
      const excluidos = ['linea-tiempo', 'quiz-portada', 'acordeones'];

      candidatas.forEach(function (carta) {
        if (excluidos.indexOf(carta.id) !== -1) return;
        if (carta.querySelector('table')) return;          // el cuadro comparativo

        carta.classList.add('carta-3d');

        if (getComputedStyle(carta).position === 'static') {
          carta.style.position = 'relative';
        }

        // Reflejo
        if (hayCursor && !movimientoReducido) {
          const brillo = document.createElement('span');
          brillo.className = 'carta-brillo';
          brillo.setAttribute('aria-hidden', 'true');
          carta.appendChild(brillo);
        }

        function inclinar(e) {
          const r = carta.getBoundingClientRect();

          // Si la tarjeta está desplegada y es grande, no se inclina
          if (r.height > 700 || r.width > 900) {
            carta.style.transform = '';
            return;
          }

          const x = (e.clientX - r.left) / r.width;    // 0 a 1
          const y = (e.clientY - r.top) / r.height;

          const giroY = (x - .5) * 2 * INCLINACION;
          const giroX = (.5 - y) * 2 * INCLINACION;

          carta.style.transform =
            'perspective(1000px) rotateX(' + giroX.toFixed(2) + 'deg) rotateY(' +
            giroY.toFixed(2) + 'deg) translateY(-' + LEVANTA + 'px)';

          carta.style.setProperty('--brillo-x', (x * 100).toFixed(1) + '%');
          carta.style.setProperty('--brillo-y', (y * 100).toFixed(1) + '%');
        }

        function soltar() {
          carta.classList.remove('inclinando', 'presionada');
          carta.style.transform = '';
        }

        if (hayCursor && !movimientoReducido) {
          carta.addEventListener('pointerenter', function () { carta.classList.add('inclinando'); });
          carta.addEventListener('pointermove', inclinar);
          carta.addEventListener('pointerleave', soltar);
        }

        // Hundido al presionar
        carta.addEventListener('pointerdown', function () { carta.classList.add('presionada'); });
        carta.addEventListener('pointerup',   function () { carta.classList.remove('presionada'); });
        carta.addEventListener('pointercancel', soltar);

        // Pulso al tocar en pantallas táctiles
        if (!hayCursor && !movimientoReducido) {
          carta.addEventListener('touchstart', function () {
            carta.classList.remove('pulsada');
            void carta.offsetWidth;
            carta.classList.add('pulsada');
            setTimeout(function () { carta.classList.remove('pulsada'); }, 460);
          }, { passive: true });
        }
      });

      /* --- Fichas del equipo -------------------------------------------
         Aquí la inclinación viaja por variables CSS para no pisar el
         volteo de la tarjeta.                                            */
      if (hayCursor && !movimientoReducido) {
        document.querySelectorAll('[data-ficha]').forEach(function (ficha) {
          const interior = ficha.querySelector('.ficha-interior');
          if (!interior) return;

          ficha.addEventListener('pointermove', function (e) {
            const r = ficha.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width;
            const y = (e.clientY - r.top) / r.height;

            interior.style.setProperty('--inclina-y', ((x - .5) * 2 * 6).toFixed(2) + 'deg');
            interior.style.setProperty('--inclina-x', ((.5 - y) * 2 * 6).toFixed(2) + 'deg');
          });

          ficha.addEventListener('pointerleave', function () {
            interior.style.setProperty('--inclina-y', '0deg');
            interior.style.setProperty('--inclina-x', '0deg');
          });
        });
      }

    })();

  });

})();

/* ==========================================================================
   [8] CAPA INTERACTIVA
   Todo lo que se añadió en la última pulida vive aquí, en su propio
   módulo, para que los bloques anteriores sigan intactos.

   8.1 · Tema claro / oscuro con memoria
   8.2 · Índice lateral con puntos y progreso de estudio
   8.3 · Buscador rápido en toda la guía
   8.4 · Panel de atajos y tamaño de letra
   8.5 · Ondas al pulsar, parallax del hero y detalles finos
   ========================================================================== */

(function () {
  'use strict';

  const raiz = document.documentElement;

  const CLAVE_TEMA     = 'chester-tema';
  const CLAVE_PROGRESO = 'chester-progreso';
  const CLAVE_TEXTO    = 'chester-texto';

  const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mapa de secciones: alimenta el índice lateral y el buscador */
  const SECCIONES = [
    { id: 'inicio',       nombre: 'Portada',        modulo: false },
    { id: 'introduccion', nombre: 'Antes de leer',  modulo: false },
    { id: 'modulo-1',     nombre: 'Ciencia',        modulo: true  },
    { id: 'modulo-2',     nombre: 'Sociología',     modulo: true  },
    { id: 'modulo-3',     nombre: 'Historia',       modulo: true  },
    { id: 'modulo-4',     nombre: 'Precursores',    modulo: true  },
    { id: 'modulo-5',     nombre: 'Corrientes',     modulo: true  },
    { id: 'evaluacion',   nombre: 'Evaluación',     modulo: false },
    { id: 'equipo',       nombre: 'Creadores',      modulo: false },
    { id: 'creditos',     nombre: 'Créditos',       modulo: false }
  ];

  /* --- Ayudas breves ---------------------------------------------------- */

  function leer(clave) {
    try { return window.localStorage.getItem(clave); } catch (e) { return null; }
  }
  function guardar(clave, valor) {
    try { window.localStorage.setItem(clave, valor); } catch (e) { /* modo privado */ }
  }

  /* Aviso flotante reutilizando el contenedor que ya existe en el HTML */
  function avisar(texto, icono) {
    const caja = document.getElementById('avisos');
    if (!caja) return;
    const aviso = document.createElement('div');
    aviso.className = 'aviso';
    aviso.innerHTML = '<span aria-hidden="true">' + (icono || '📘') + '</span><span></span>';
    aviso.lastChild.textContent = texto;
    caja.appendChild(aviso);
    setTimeout(function () {
      aviso.classList.add('saliendo');
      setTimeout(function () { aviso.remove(); }, 320);
    }, 2400);
  }

  /* Texto sin tildes ni mayúsculas, para que la búsqueda sea tolerante */
  function normalizar(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function escapar(texto) {
    return texto.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function arrancar(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  arrancar(function () {

    /* ====================================================================
       8.1 · TEMA CLARO / OSCURO
       El tema se decide antes de pintar (script en el <head>); aquí solo
       se atiende el interruptor y se recuerda la elección.
       ==================================================================== */

    const botonesTema = document.querySelectorAll('[data-tema-btn]');

    function aplicarTema(tema, conAnimacion) {
      if (conAnimacion && !movimientoReducido) {
        raiz.classList.add('cambiando-tema');
        window.setTimeout(function () { raiz.classList.remove('cambiando-tema'); }, 480);
      }

      raiz.setAttribute('data-tema', tema);
      guardar(CLAVE_TEMA, tema);

      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', tema === 'oscuro' ? '#12151D' : '#F7F3E8');

      botonesTema.forEach(function (boton) {
        boton.setAttribute('aria-pressed', tema === 'oscuro' ? 'true' : 'false');
        boton.setAttribute('title', tema === 'oscuro' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
        const etiqueta = boton.querySelector('[data-tema-etiqueta]');
        if (etiqueta) etiqueta.textContent = tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro';
      });
    }

    function alternarTema() {
      const nuevo = raiz.getAttribute('data-tema') === 'oscuro' ? 'claro' : 'oscuro';
      aplicarTema(nuevo, true);
      avisar(nuevo === 'oscuro' ? 'Modo oscuro' : 'Modo claro', nuevo === 'oscuro' ? '🌙' : '☀️');
    }

    botonesTema.forEach(function (boton) {
      boton.addEventListener('click', alternarTema);
    });

    aplicarTema(raiz.getAttribute('data-tema') || 'claro', false);

    /* Si nadie eligió tema, se sigue al sistema operativo en vivo */
    const consultaOscuro = window.matchMedia('(prefers-color-scheme: dark)');
    if (consultaOscuro.addEventListener) {
      consultaOscuro.addEventListener('change', function (e) {
        if (!leer(CLAVE_TEMA + '-fijado')) aplicarTema(e.matches ? 'oscuro' : 'claro', true);
      });
    }
    botonesTema.forEach(function (boton) {
      boton.addEventListener('click', function () { guardar(CLAVE_TEMA + '-fijado', '1'); });
    });


    /* ====================================================================
       8.2 · ÍNDICE LATERAL Y PROGRESO DE ESTUDIO
       ==================================================================== */

    const presentes = SECCIONES.filter(function (s) { return document.getElementById(s.id); });
    const modulos   = presentes.filter(function (s) { return s.modulo; });

    /* Módulos ya recorridos, recuperados de la visita anterior */
    let estudiados = [];
    try {
      const crudo = JSON.parse(leer(CLAVE_PROGRESO) || '[]');
      if (Array.isArray(crudo)) estudiados = crudo.filter(function (id) {
        return modulos.some(function (m) { return m.id === id; });
      });
    } catch (e) { estudiados = []; }

    const RADIO = 14;
    const VUELTA = 2 * Math.PI * RADIO;

    const dock = document.createElement('nav');
    dock.className = 'dock';
    dock.setAttribute('aria-label', 'Índice rápido de secciones');

    let dockHTML =
      '<div class="dock-progreso" data-progreso title="Módulos recorridos">' +
        '<svg viewBox="0 0 36 36" aria-hidden="true">' +
          '<circle class="pista" cx="18" cy="18" r="' + RADIO + '"></circle>' +
          '<circle class="avance" cx="18" cy="18" r="' + RADIO + '" ' +
                  'stroke-dasharray="' + VUELTA.toFixed(1) + '" stroke-dashoffset="' + VUELTA.toFixed(1) + '"></circle>' +
        '</svg>' +
        '<span data-progreso-texto>0/' + modulos.length + '</span>' +
      '</div>' +
      '<span class="dock-separador" aria-hidden="true"></span>';

    presentes.forEach(function (s) {
      dockHTML +=
        '<a class="dock-punto" href="#' + s.id + '" data-punto="' + s.id + '">' +
          '<span>' + s.nombre + '</span>' +
          '<span class="solo-lectores">Ir a ' + s.nombre + '</span>' +
        '</a>';
    });

    dock.innerHTML = dockHTML;
    document.body.appendChild(dock);

    const puntos        = dock.querySelectorAll('[data-punto]');
    const anilloAvance  = dock.querySelector('.avance');
    const textoProgreso = dock.querySelector('[data-progreso-texto]');

    function pintarProgreso() {
      const hechos = estudiados.length;
      const razon  = modulos.length ? hechos / modulos.length : 0;

      if (anilloAvance) anilloAvance.setAttribute('stroke-dashoffset', (VUELTA * (1 - razon)).toFixed(1));
      if (textoProgreso) textoProgreso.textContent = hechos + '/' + modulos.length;

      puntos.forEach(function (p) {
        p.classList.toggle('leido', estudiados.indexOf(p.dataset.punto) !== -1);
      });
      estudiados.forEach(function (id) {
        const seccion = document.getElementById(id);
        if (seccion) seccion.setAttribute('data-estudiado', 'true');
      });
    }

    let celebrado = estudiados.length === modulos.length;

    function marcarEstudiado(id) {
      if (estudiados.indexOf(id) !== -1) return;
      estudiados.push(id);
      guardar(CLAVE_PROGRESO, JSON.stringify(estudiados));
      pintarProgreso();

      if (estudiados.length === modulos.length && !celebrado) {
        celebrado = true;
        window.setTimeout(function () {
          avisar('¡Recorriste los cinco módulos!', '🎓');
        }, 700);
      }
    }

    pintarProgreso();

    /* Sección activa en el índice + marcado de módulo recorrido */
    if ('IntersectionObserver' in window) {
      const observadorDock = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          const id = e.target.id;

          if (e.isIntersecting && e.intersectionRatio > 0.12) {
            puntos.forEach(function (p) {
              p.classList.toggle('activo', p.dataset.punto === id);
            });
          }
          if (e.intersectionRatio > 0.45) marcarEstudiado(id);
        });
      }, { threshold: [0.12, 0.45] });

      presentes.forEach(function (s) {
        observadorDock.observe(document.getElementById(s.id));
      });
    }

    /* El índice aparece cuando ya se dejó atrás la portada */
    let pendienteDock = false;
    function refrescarDock() {
      dock.classList.toggle('visible', window.scrollY > 420);
    }
    window.addEventListener('scroll', function () {
      if (pendienteDock) return;
      pendienteDock = true;
      window.requestAnimationFrame(function () {
        refrescarDock();
        pendienteDock = false;
      });
    }, { passive: true });
    refrescarDock();


    /* ====================================================================
       8.3 · BUSCADOR RÁPIDO
       Recorre títulos, párrafos y listas de la guía. El índice se arma
       la primera vez que se abre, no al cargar la página.
       ==================================================================== */

    const buscador = document.createElement('div');
    buscador.className = 'buscador';
    buscador.id = 'buscador';
    buscador.setAttribute('role', 'dialog');
    buscador.setAttribute('aria-modal', 'true');
    buscador.setAttribute('aria-label', 'Buscar dentro de la guía');
    buscador.innerHTML =
      '<div class="buscador-caja">' +
        '<div class="buscador-cabeza">' +
          '<span aria-hidden="true">🔍</span>' +
          '<input type="search" class="buscador-campo" id="buscador-campo" autocomplete="off" ' +
                 'placeholder="Buscar un concepto, autor o corriente…" aria-label="Buscar en la guía">' +
          '<span class="buscador-tecla">Esc</span>' +
        '</div>' +
        '<div class="buscador-lista" id="buscador-lista"></div>' +
        '<div class="buscador-pie">' +
          '<span><kbd>↑</kbd><kbd>↓</kbd> moverse</span>' +
          '<span><kbd>Enter</kbd> ir al fragmento</span>' +
          '<span><kbd>/</kbd> abrir el buscador</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(buscador);

    const campo = buscador.querySelector('#buscador-campo');
    const lista = buscador.querySelector('#buscador-lista');

    let indice = null;
    let resultados = [];
    let marcado = 0;
    let devolverFoco = null;

    function construirIndice() {
      if (indice) return indice;
      indice = [];

      const nodos = document.querySelectorAll(
        'main h2, main h3, main h4, main p, main li, main dd, main td, main figcaption, main blockquote'
      );

      nodos.forEach(function (el) {
        if (el.closest('.buscador') || el.closest('.atajos') || el.closest('nav')) return;

        const texto = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (texto.length < 14 || texto.length > 600) return;

        const seccion = el.closest('section[id]');
        const ficha = seccion
          ? (SECCIONES.filter(function (s) { return s.id === seccion.id; })[0] || null)
          : null;

        indice.push({
          el: el,
          texto: texto,
          plano: normalizar(texto),
          origen: ficha ? ficha.nombre : 'Guía',
          titulo: /^H[234]$/.test(el.tagName)
        });
      });

      return indice;
    }

    function buscar(consulta) {
      const limpia = normalizar(consulta.trim());
      if (limpia.length < 2) return [];

      const piezas = limpia.split(/\s+/);
      const encontrados = [];

      construirIndice().forEach(function (item) {
        let posicion = -1;
        const todas = piezas.every(function (p) {
          const i = item.plano.indexOf(p);
          if (i === -1) return false;
          if (posicion === -1 || i < posicion) posicion = i;
          return true;
        });
        if (!todas) return;

        encontrados.push({
          item: item,
          peso: (item.titulo ? 0 : 100) + posicion + item.texto.length / 400
        });
      });

      encontrados.sort(function (a, b) { return a.peso - b.peso; });
      return encontrados.slice(0, 8).map(function (r) { return r.item; });
    }

    /* Recorta el texto alrededor de la coincidencia y la resalta */
    function fragmento(item, consulta) {
      const pieza = normalizar(consulta.trim()).split(/\s+/)[0];
      const donde = item.plano.indexOf(pieza);
      const desde = Math.max(0, donde - 55);
      const hasta = Math.min(item.texto.length, donde + pieza.length + 110);

      let recorte = item.texto.slice(desde, hasta);
      if (desde > 0) recorte = '…' + recorte;
      if (hasta < item.texto.length) recorte += '…';

      const salida = escapar(recorte);
      const plano  = normalizar(recorte);
      const inicio = plano.indexOf(pieza);
      if (inicio === -1) return salida;

      /* Se recorta sobre el texto ya escapado usando la misma posición,
         seguro porque escapar() nunca acorta la cadena. */
      const previo  = escapar(recorte.slice(0, inicio));
      const medio   = escapar(recorte.slice(inicio, inicio + pieza.length));
      const resto   = escapar(recorte.slice(inicio + pieza.length));
      return previo + '<b>' + medio + '</b>' + resto;
    }

    function pintarResultados(consulta) {
      lista.innerHTML = '';
      marcado = 0;

      if (!consulta.trim()) {
        lista.innerHTML = '<p class="buscador-vacio">Escribe para buscar en los cinco módulos.</p>';
        return;
      }
      if (!resultados.length) {
        lista.innerHTML = '<p class="buscador-vacio">Sin coincidencias para «' +
                          escapar(consulta.trim()) + '».</p>';
        return;
      }

      resultados.forEach(function (item, i) {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'buscador-item' + (i === 0 ? ' marcado' : '');
        boton.innerHTML =
          '<span class="buscador-origen">' + escapar(item.origen) + '</span>' +
          '<span class="buscador-texto">' + fragmento(item, consulta) + '</span>';
        boton.addEventListener('click', function () { irA(item.el); });
        lista.appendChild(boton);
      });
    }

    function moverMarca(paso) {
      const items = lista.querySelectorAll('.buscador-item');
      if (!items.length) return;
      items[marcado].classList.remove('marcado');
      marcado = (marcado + paso + items.length) % items.length;
      items[marcado].classList.add('marcado');
      items[marcado].scrollIntoView({ block: 'nearest' });
    }

    /* Abre acordeones, hitos o el quiz si el resultado está guardado dentro */
    function destapar(el) {
      const panelAcordeon = el.closest('.acordeon-panel');
      if (panelAcordeon && panelAcordeon.dataset.abierto !== 'true') {
        const disparador = document.querySelector('[aria-controls="' + panelAcordeon.id + '"]');
        if (disparador) disparador.click();
      }

      const panelHito = el.closest('.panel-hito');
      if (panelHito && panelHito.hasAttribute('hidden')) {
        const hito = document.querySelector('.hito[data-panel="' + panelHito.id + '"]');
        if (hito) hito.click();
      }

      const cuerpoQuiz = el.closest('.quiz-cuerpo');
      if (cuerpoQuiz && cuerpoQuiz.dataset.abierto !== 'true') {
        const abrirQuiz = document.getElementById('quiz-abrir');
        if (abrirQuiz) abrirQuiz.click();
      }

      /* Si el bloque todavía no se reveló al hacer scroll, se muestra ya */
      let padre = el.closest('.revelar');
      while (padre) {
        padre.classList.add('visible');
        padre = padre.parentElement ? padre.parentElement.closest('.revelar') : null;
      }
    }

    function irA(el) {
      cerrarBuscador(true);
      destapar(el);

      window.setTimeout(function () {
        el.scrollIntoView({ behavior: movimientoReducido ? 'auto' : 'smooth', block: 'center' });
        el.classList.remove('resaltado');
        void el.offsetWidth;
        el.classList.add('resaltado');
        window.setTimeout(function () { el.classList.remove('resaltado'); }, 2800);
      }, 280);
    }

    function abrirBuscador() {
      devolverFoco = document.activeElement;
      buscador.classList.add('abierto');
      document.body.style.overflow = 'hidden';
      campo.value = '';
      resultados = [];
      pintarResultados('');
      window.setTimeout(function () { campo.focus(); }, 60);
    }

    function cerrarBuscador(sinFoco) {
      buscador.classList.remove('abierto');
      document.body.style.overflow = '';
      if (!sinFoco && devolverFoco && devolverFoco.focus) devolverFoco.focus();
    }

    campo.addEventListener('input', function () {
      resultados = buscar(campo.value);
      pintarResultados(campo.value);
    });

    campo.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown')      { e.preventDefault(); moverMarca(1); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); moverMarca(-1); }
      else if (e.key === 'Enter')     {
        e.preventDefault();
        if (resultados[marcado]) irA(resultados[marcado].el);
      }
      else if (e.key === 'Escape')    { cerrarBuscador(); }
    });

    buscador.addEventListener('click', function (e) {
      if (e.target === buscador) cerrarBuscador();
    });


    /* ====================================================================
       8.4 · PANEL DE ATAJOS, TAMAÑO DE LETRA Y BOTONES FLOTANTES
       ==================================================================== */

    const atajos = document.createElement('div');
    atajos.className = 'atajos';
    atajos.setAttribute('role', 'dialog');
    atajos.setAttribute('aria-modal', 'true');
    atajos.setAttribute('aria-label', 'Atajos de teclado y ajustes');
    atajos.innerHTML =
      '<div class="atajos-caja">' +
        '<h2 class="atajos-titulo">Atajos y ajustes</h2>' +
        '<p class="atajos-sub">Para moverte por la guía sin soltar el teclado.</p>' +
        '<div class="atajo-fila"><span>Ir a un módulo</span><span><kbd>1</kbd>–<kbd>5</kbd></span></div>' +
        '<div class="atajo-fila"><span>Buscar en la guía</span><kbd>/</kbd></div>' +
        '<div class="atajo-fila"><span>Evaluación</span><kbd>Q</kbd></div>' +
        '<div class="atajo-fila"><span>Creadores</span><kbd>C</kbd></div>' +
        '<div class="atajo-fila"><span>Cambiar de tema</span><kbd>T</kbd></div>' +
        '<div class="atajo-fila"><span>Abrir esta ventana</span><kbd>?</kbd></div>' +
        '<div class="atajo-fila">' +
          '<span>Tamaño de la letra</span>' +
          '<span class="texto-ajuste">' +
            '<button type="button" data-texto="-1" aria-label="Reducir el tamaño de la letra">A−</button>' +
            '<button type="button" data-texto="1" aria-label="Aumentar el tamaño de la letra">A+</button>' +
          '</span>' +
        '</div>' +
        '<div class="atajo-fila">' +
          '<span>Progreso de lectura</span>' +
          '<button type="button" class="btn btn-contorno atajos-mini" data-reiniciar-progreso>Reiniciar</button>' +
        '</div>' +
        '<button type="button" class="btn btn-oro atajos-cerrar" data-cerrar-atajos>Entendido</button>' +
      '</div>';
    document.body.appendChild(atajos);

    function abrirAtajos() {
      atajos.classList.add('abierto');
      const cerrar = atajos.querySelector('[data-cerrar-atajos]');
      if (cerrar) window.setTimeout(function () { cerrar.focus(); }, 60);
    }
    function cerrarAtajos() { atajos.classList.remove('abierto'); }

    atajos.addEventListener('click', function (e) {
      if (e.target === atajos || e.target.closest('[data-cerrar-atajos]')) cerrarAtajos();
    });

    /* Tamaño de la letra: escala toda la maqueta, que está en rem */
    const PASOS = [93.75, 100, 106.25, 112.5];
    let pasoTexto = parseInt(leer(CLAVE_TEXTO), 10);
    if (isNaN(pasoTexto) || pasoTexto < 0 || pasoTexto >= PASOS.length) pasoTexto = 1;

    function aplicarTexto() {
      raiz.style.fontSize = PASOS[pasoTexto] + '%';
      guardar(CLAVE_TEXTO, String(pasoTexto));
    }
    aplicarTexto();

    atajos.querySelectorAll('[data-texto]').forEach(function (boton) {
      boton.addEventListener('click', function () {
        const salto = parseInt(boton.dataset.texto, 10);
        const nuevo = Math.min(PASOS.length - 1, Math.max(0, pasoTexto + salto));
        if (nuevo === pasoTexto) { avisar('Ya estás en el límite', '🔤'); return; }
        pasoTexto = nuevo;
        aplicarTexto();
        avisar('Texto al ' + PASOS[pasoTexto] + '%', '🔤');
      });
    });

    const btnReinicio = atajos.querySelector('[data-reiniciar-progreso]');
    if (btnReinicio) {
      btnReinicio.addEventListener('click', function () {
        estudiados = [];
        celebrado = false;
        guardar(CLAVE_PROGRESO, '[]');
        modulos.forEach(function (m) {
          const seccion = document.getElementById(m.id);
          if (seccion) seccion.removeAttribute('data-estudiado');
        });
        pintarProgreso();
        avisar('Progreso reiniciado', '🔄');
      });
    }

    /* Botones flotantes: buscar y atajos, encima del "volver arriba" */
    const flotantes = document.createElement('div');
    flotantes.className = 'flotantes';
    flotantes.innerHTML =
      '<button type="button" class="flotante-btn visible" data-abrir-buscador aria-label="Buscar en la guía" title="Buscar  ·  /">' +
        '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">' +
          '<circle cx="11" cy="11" r="7"/><path stroke-linecap="round" d="M20 20l-3.5-3.5"/>' +
        '</svg>' +
      '</button>' +
      '<button type="button" class="flotante-btn visible" data-abrir-atajos aria-label="Ver atajos de teclado y ajustes" title="Atajos  ·  ?">' +
        '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">' +
          '<rect x="2.5" y="6" width="19" height="12" rx="3"/>' +
          '<path stroke-linecap="round" d="M7 10h.01M11 10h.01M15 10h.01M8 14h8"/>' +
        '</svg>' +
      '</button>';
    document.body.appendChild(flotantes);

    flotantes.querySelector('[data-abrir-buscador]').addEventListener('click', abrirBuscador);
    flotantes.querySelector('[data-abrir-atajos]').addEventListener('click', abrirAtajos);

    /* Atajos nuevos, sin estorbar a los que ya existían */
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const foco = e.target;
      const escribiendo = !!(foco && foco.matches && foco.matches('input, textarea, select'));

      if (e.key === 'Escape') {
        if (buscador.classList.contains('abierto')) cerrarBuscador();
        if (atajos.classList.contains('abierto')) cerrarAtajos();
        return;
      }
      if (escribiendo) return;

      if (e.key === '/') {
        e.preventDefault();
        abrirBuscador();
      } else if (e.key === '?') {
        e.preventDefault();
        abrirAtajos();
      } else if (e.key.toLowerCase() === 't') {
        alternarTema();
      }
    });


    /* ====================================================================
       8.5 · MICROINTERACCIONES
       ==================================================================== */

    /* Onda circular en el punto exacto donde se pulsa */
    if (!movimientoReducido) {
      document.addEventListener('pointerdown', function (e) {
        const objetivo = e.target.closest('.btn, .ficha-boton, .acordeon-btn, .flotante-btn, .btn-tema');
        if (!objetivo) return;

        const caja = objetivo.getBoundingClientRect();
        const lado = Math.max(caja.width, caja.height);

        const onda = document.createElement('span');
        onda.className = 'onda';
        onda.style.width = onda.style.height = lado + 'px';
        onda.style.left = (e.clientX - caja.left - lado / 2) + 'px';
        onda.style.top  = (e.clientY - caja.top  - lado / 2) + 'px';

        objetivo.appendChild(onda);
        window.setTimeout(function () { onda.remove(); }, 640);
      });
    }

    /* Las manchas de acuarela del hero se mueven a distinta velocidad */
    const manchas = document.querySelectorAll('#inicio .mancha');
    if (manchas.length && !movimientoReducido) {
      let pendienteParallax = false;

      window.addEventListener('scroll', function () {
        if (pendienteParallax) return;
        pendienteParallax = true;

        window.requestAnimationFrame(function () {
          const y = window.scrollY;
          if (y < 900) {
            manchas.forEach(function (mancha, i) {
              const factor = 0.08 + i * 0.06;
              mancha.style.transform = 'translate3d(0,' + (y * factor).toFixed(1) + 'px,0)';
            });
          }
          pendienteParallax = false;
        });
      }, { passive: true });
    }

    /* Aviso de bienvenida discreto, solo la primera vez de cada visita */
    window.setTimeout(function () {
      if (!leer('chester-saludo')) {
        guardar('chester-saludo', '1');
        avisar('Pulsa «?» para ver los atajos', '⌨️');
      }
    }, 2600);

  });

})();
