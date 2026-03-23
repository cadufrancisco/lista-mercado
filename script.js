// 1. SELEÇÃO DE ELEMENTOS
const inputItem = document.querySelector("#inputItem");
const btnAdicionar = document.querySelector("#btnAdicionar");
const listaUl = document.querySelector("#lista");
const btnLimpar = document.querySelector("#btnLimpar");
const listaForm = document.querySelector("#listaForm");
const resumo = document.querySelector("#resumo");

listaForm.addEventListener("submit", (evento) => {
  evento.preventDefault(); // IMPORTANTE: Impede a página de recarregar

  const nome = inputItem.value.trim();
  if (nome !== "") {
    listaCompras.push({ nome: nome, comprado: false });
    inputItem.value = "";
    renderizar();
  }
});
// 2. CARREGAR DADOS (Busca o que está salvo ou começa com lista vazia)
let listaCompras = JSON.parse(localStorage.getItem("minha_lista")) || [];

// 3. FUNÇÃO PARA RENDERIZAR (Desenhar na tela)
function renderizar() {
  const listaUl = document.querySelector("#lista");
  //listaUl.innerHTML = ""; // Limpa a lista antes de desenhar

  // GARANTIA: Limpa tudo antes de começar
  while (listaUl.firstChild) {
    listaUl.removeChild(listaUl.firstChild);
  }

  listaCompras.forEach((item, index) => {
    const li = document.createElement("li");
    //li.innerText = item.nome;

    // APLICA A ANIMAÇÃO AQUI
    li.classList.add("animar-entrada");

    // Criamos um container para o texto para separar do botão
    const texto = document.createElement("span");
    texto.innerText = item.nome;
    if (item.comprado) texto.classList.add("comprado");

    // Botão de remover (Lixeira)
    const btnRemover = document.createElement("button");
    btnRemover.innerText = "🗑️";
    btnRemover.onclick = (e) => {
      e.stopPropagation();
      listaCompras.splice(index, 1);
      renderizar();
    };

    li.appendChild(texto);
    li.appendChild(btnRemover);

    // Clique na linha toda para dar baixa
    li.onclick = () => {
      item.comprado = !item.comprado;
      renderizar();
    };

    listaUl.appendChild(li);
  });
  /*
    // Criamos um span para o nome do item
    const spanNome = document.createElement("span");
    spanNome.innerText = item.nome;
    if (item.comprado) spanNome.classList.add("comprado");

    // Se estiver comprado, adiciona a classe CSS que criamos
    // if (item.comprado) li.classList.add("comprado");

    // Clique no nome para dar baixa (o que já tínhamos)
    spanNome.onclick = () => {
      item.comprado = !item.comprado;
      renderizar();
    };

    // 1. CRIAR A LIXEIRA
    const btnRemover = document.createElement("button");
    btnRemover.innerText = "🗑️"; // Pode usar um emoji ou ícone
    btnRemover.classList.add("btn-lixeira");

    // 2. LÓGICA DE EXCLUIR
    btnRemover.onclick = (e) => {
      e.stopPropagation(); // Impede que o clique "acerte" o li e dê baixa sem querer
      listaCompras.splice(index, 1); // Remove 1 item na posição 'index'
      renderizar();
    };

    li.appendChild(spanNome);
    li.appendChild(btnRemover);
    listaUl.appendChild(li);

    // Clique para "Dar Baixa"
    li.onclick = () => {
      listaCompras[index].comprado = !listaCompras[index].comprado;
      salvarERenderizar();
    };

    listaUl.appendChild(li);
  });
*/

  // --- LÓGICA DO CONTADOR ---
  const total = listaCompras.length;
  const comprados = listaCompras.filter((item) => item.comprado).length;

  resumo.innerText = `Itens: ${total} | Comprados: ${comprados}`;

  // Dica visual: Se todos forem comprados, mude a cor do contador!
  if (total > 0 && total === comprados) {
    resumo.style.color = "green";
    resumo.innerText += " ✅ Tudo pronto!";
  } else {
    resumo.style.color = "black";
  }
  // Salva no "caderninho" do navegador
  localStorage.setItem("minha_lista", JSON.stringify(listaCompras));
}

function salvarERenderizar() {
  renderizar();
}

// 4. EVENTO: ADICIONAR ITEM
btnAdicionar.onclick = () => {
  const nome = inputItem.value.trim();

  if (nome !== "") {
    listaCompras.push({ nome: nome, comprado: false });
    inputItem.value = ""; // Limpa o campo
    salvarERenderizar();
  }
};

// 5. EVENTO: LIMPAR COMPRADOS (O famoso Filter!)
btnLimpar.onclick = () => {
  listaCompras = listaCompras.filter((item) => !item.comprado);
  salvarERenderizar();
};

// Iniciar a tela pela primeira vez
renderizar();
