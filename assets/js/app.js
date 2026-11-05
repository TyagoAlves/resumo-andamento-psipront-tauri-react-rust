/* Clínica Psi — interações da página de apresentação. */
(function () {
  'use strict';

  var reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- topo com sombra ao rolar ---------- */
  var topo = document.getElementById('topo');
  var aoRolar = function () {
    if (!topo) return;
    topo.classList.toggle('rolado', window.scrollY > 8);
  };
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  /* ---------- galeria de telas ---------- */
  var imagem = document.getElementById('galeria-imagem');
  var legenda = document.getElementById('galeria-legenda');
  var miniaturas = Array.prototype.slice.call(document.querySelectorAll('.miniatura'));
  var base = 'assets/prints/';
  var preenchido = {};

  function preCarregar(nome) {
    if (preenchido[nome]) return;
    var img = new Image();
    img.src = base + nome + '.jpg';
    preenchido[nome] = true;
  }

  function selecionar(botao, focar) {
    if (!botao || !imagem) return;
    var nome = botao.getAttribute('data-print');
    if (!nome) return;

    miniaturas.forEach(function (b) {
      var ativo = b === botao;
      b.classList.toggle('ativa', ativo);
      b.setAttribute('aria-selected', ativo ? 'true' : 'false');
      b.tabIndex = ativo ? 0 : -1;
    });

    if (focar) botao.focus();

    var trocar = function () {
      imagem.src = base + nome + '.jpg';
      imagem.alt = botao.getAttribute('data-legenda') || '';
      if (legenda) legenda.textContent = botao.getAttribute('data-legenda') || '';
      requestAnimationFrame(function () {
        imagem.classList.remove('trocando');
      });
    };

    if (reduzirMovimento) {
      trocar();
    } else {
      imagem.classList.add('trocando');
      var proxima = new Image();
      proxima.onload = trocar;
      proxima.onerror = trocar;
      proxima.src = base + nome + '.jpg';
      // rede lenta: não deixa a imagem apagada para sempre
      window.setTimeout(function () {
        if (imagem.classList.contains('trocando')) trocar();
      }, 400);
    }
  }

  miniaturas.forEach(function (botao, indice) {
    botao.addEventListener('click', function () {
      selecionar(botao, false);
    });

    botao.addEventListener('keydown', function (evento) {
      var destino = null;
      if (evento.key === 'ArrowRight' || evento.key === 'ArrowDown') {
        destino = miniaturas[(indice + 1) % miniaturas.length];
      } else if (evento.key === 'ArrowLeft' || evento.key === 'ArrowUp') {
        destino = miniaturas[(indice - 1 + miniaturas.length) % miniaturas.length];
      } else if (evento.key === 'Home') {
        destino = miniaturas[0];
      } else if (evento.key === 'End') {
        destino = miniaturas[miniaturas.length - 1];
      }
      if (destino) {
        evento.preventDefault();
        selecionar(destino, true);
      }
    });

    botao.addEventListener('mouseenter', function () {
      var nome = botao.getAttribute('data-print');
      if (nome) preCarregar(nome);
    });
  });

  /* ---------- entrada suave dos blocos ---------- */
  var revelaveis = Array.prototype.slice.call(document.querySelectorAll('.revelar'));

  if (!('IntersectionObserver' in window) || reduzirMovimento) {
    revelaveis.forEach(function (el) { el.classList.add('visivel'); });
  } else {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        var el = entrada.target;
        el.classList.add('visivel');
        observador.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revelaveis.forEach(function (el, indice) {
      // pequeno escalonamento dentro de grades
      var irmaos = el.parentElement ? el.parentElement.children : [];
      var posicao = Array.prototype.indexOf.call(irmaos, el);
      if (posicao > 0 && posicao < 8) {
        el.style.transitionDelay = (posicao * 60) + 'ms';
      }
      observador.observe(el);
    });
  }
})();
