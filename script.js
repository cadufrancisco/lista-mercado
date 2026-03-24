import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0nNYUJ4aRAM-Z4LdzDIC6uvrOaZIKgaU", // Pegue na engrenagem do Firebase
  authDomain: "lista-mercado-99783.firebaseapp.com",
  projectId: "lista-mercado-99783",
  storageBucket: "lista-mercado-99783.appspot.com",
  messagingSenderId: "676651330576",
  appId: "1:676651330576:web:c5828986c381b9080fae95",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const docRef = doc(db, "compras", "lista_familia");

// --- SINCRONIZAÇÃO EM TEMPO REAL ---
onSnapshot(docRef, (snap) => {
  if (snap.exists()) {
    listaCompras = snap.data().itens || [];
    renderizar(); // Desenha na tela sempre que alguém mudar algo
  }
});

// Substitua sua função de salvar por esta:
async function salvarNoFirebase() {
  await setDoc(docRef, { itens: listaCompras });
}

// 1. SELEÇÃO DE ELEMENTOS
const inputItem = document.querySelector("#inputItem");
const btnAdicionar = document.querySelector("#btnAdicionar");
const listaUl = document.querySelector("#lista");
const btnLimpar = document.querySelector("#btnLimpar");
const listaForm = document.querySelector("#listaForm");
const resumo = document.querySelector("#resumo");
const btnFinalizar = document.querySelector("#btnFinalizar");

listaForm.addEventListener("submit", (evento) => {
  evento.preventDefault(); // IMPORTANTE: Impede a página de recarregar

  const nome = inputItem.value.trim();
  if (nome !== "") {
    listaCompras.push({ nome: nome, comprado: false });
    salvarNoFirebase();
    inputItem.value = "";
    renderizar();
  }
});
// 2. CARREGAR DADOS (Busca o que está salvo ou começa com lista vazia)
//let listaCompras = JSON.parse(localStorage.getItem("minha_lista")) || [];
let listaCompras = [];

// 3. FUNÇÃO PARA RENDERIZAR (Desenhar na tela)
function renderizar() {
  const listaUl = document.querySelector("#lista");
  listaUl.innerHTML = "";

  // 1. DESENHAR OS ITENS
  listaCompras.forEach((item, index) => {
    const li = document.createElement("li");

    // Container para o nome e preço
    const spanNome = document.createElement("span");
    spanNome.innerText = item.nome;

    // AQUI: Se estiver comprado, risca o SPAN do nome
    if (item.comprado) {
      spanNome.classList.add("comprado");
    }

    // AQUI: Adiciona a tag de preço se houver valor
    if (item.valor > 0) {
      const spanPreco = document.createElement("span");
      spanPreco.innerText = `R$ ${item.valor.toFixed(2)}`;
      spanPreco.classList.add("preco-tag");
      spanNome.appendChild(spanPreco);
    }

    // Botão de remover
    const btnRemover = document.createElement("button");
    btnRemover.innerText = "🗑️";
    btnRemover.className = "btn-lixeira";
    btnRemover.onclick = (e) => {
      e.stopPropagation();
      listaCompras.splice(index, 1);
      salvarNoFirebase();
      renderizar();
    };

    // Clique na linha para dar baixa
    li.onclick = () => {
      if (!item.comprado) {
        let preco = prompt(`Qual o valor de ${item.nome}?`, "0.00");
        if (preco !== null) {
          // Só marca se não cancelar o prompt
          item.valor = parseFloat(preco.replace(",", ".")) || 0;
          item.comprado = true;
          salvarNoFirebase();
        }
      } else {
        item.comprado = false;
        item.valor = 0;
      }
      renderizar();
    };

    li.appendChild(spanNome);
    li.appendChild(btnRemover);
    listaUl.appendChild(li);
  });

  // 2. ATUALIZAR O RESUMO (Fora do forEach)
  const totalItens = listaCompras.length;
  const comprados = listaCompras.filter((i) => i.comprado).length;
  const totalDinheiro = listaCompras.reduce(
    (soma, i) => soma + (i.valor || 0),
    0,
  );

  document.querySelector("#resumo").innerHTML = `
    Itens: ${totalItens} | Comprados: ${comprados} | 
    <strong>Total: R$ ${totalDinheiro.toFixed(2)}</strong>
  `;

  //localStorage.setItem("minha_lista", JSON.stringify(listaCompras));
  salvarNoFirebase(listaCompras);
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

btnFinalizar.onclick = () => {
  if (listaCompras.length === 0) return alert("Sua lista está vazia!");

  const confirmacao = confirm("Deseja salvar no histórico e limpar a lista?");
  if (confirmacao) {
    let historico = JSON.parse(localStorage.getItem("historico_compras")) || [];
    //const totalCompra = listaCompras.reduce((s, i) => s + (i.valor || 0), 0);

    // Agora salvamos a CÓPIA da lista atual dentro do histórico
    historico.push({
      data: new Date().toLocaleDateString("pt-BR"),
      //total: totalCompra,
      //itens: listaCompras.length,
      total: listaCompras.reduce((s, i) => s + (i.valor || 0), 0),
      itensDetalhados: [...listaCompras], // Aqui salvamos os nomes e preços!
    });

    localStorage.setItem("historico_compras", JSON.stringify(historico));
    listaCompras = []; // Limpa a lista atual
    renderizar();
    renderizarHistorico();
    alert("Compra salva com sucesso!");
  }
};

function renderizarHistorico() {
  const listaHistoricoUl = document.querySelector("#listaHistorico");
  const historico = JSON.parse(localStorage.getItem("historico_compras")) || [];

  if (!listaHistoricoUl) return;
  listaHistoricoUl.innerHTML = ""; // Limpa antes de desenhar

  // Vamos mostrar do mais novo para o mais antigo (.reverse)
  historico.reverse().forEach((compra, index) => {
    const li = document.createElement("li");
    li.style.cursor = "pointer"; // Muda o mouse para a mãozinha
    //li.onclick = () => abrirDetalhes(index); // Chama a função que criamos acima

    // O ?. garante que se a compra for antiga e não tiver itensDetalhados, o site não trava
    const qtdItens = compra.itensDetalhados?.length || 0;

    li.innerHTML = `
      <div>
        <strong>Data:</strong> ${compra.data} <br>
        <small>${compra.itensDetalhados.length} itens</small>
      </div>
      <strong style="color: #27ae60;">R$ ${compra.total.toFixed(2)}</strong>
    `;

    // Conecta a função de abrir o Modal
    li.onclick = () => abrirDetalhes(index);

    listaHistoricoUl.appendChild(li);
  });
}

// Função para abrir o Modal com os itens
function abrirDetalhes(index) {
  const historico = JSON.parse(localStorage.getItem("historico_compras")) || [];
  // Como usamos .reverse() na tela, precisamos pegar o índice real
  const compra = [...historico].reverse()[index];

  const modal = document.querySelector("#modalDetalhes");
  const listaItens = document.querySelector("#modalListaItens");
  const totalTxt = document.querySelector("#modalTotal");

  listaItens.innerHTML = "";
  document.querySelector("#modalTitulo").innerText = `Compra: ${compra.data}`;

  compra.itensDetalhados.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${item.nome}</span> <strong>R$ ${item.valor.toFixed(2)}</strong>`;
    listaItens.appendChild(li);
  });

  totalTxt.innerText = `Total: R$ ${compra.total.toFixed(2)}`;
  modal.style.display = "flex";
}

// Fechar Modal
document.querySelector("#fecharModal").onclick = () => {
  document.querySelector("#modalDetalhes").style.display = "none";
};

// Botão Limpar Histórico
document.querySelector("#btnLimparHistorico").onclick = () => {
  if (confirm("Tem certeza que deseja apagar todo o histórico?")) {
    localStorage.removeItem("historico_compras");
    renderizarHistorico();
  }
};

function verDetalhes(index) {
  const historico = JSON.parse(localStorage.getItem("historico_compras")) || [];
  const compra = historico.reverse()[index]; // Pegamos a compra certa

  // Montamos o texto da lista
  let textoLista = `Compra do dia ${compra.data}:\n\n`;

  compra.itensDetalhados.forEach((item) => {
    textoLista += `- ${item.nome}: R$ ${item.valor.toFixed(2)}\n`;
  });

  textoLista += `\nTOTAL: R$ ${compra.total.toFixed(2)}`;

  alert(textoLista); // Mostra a lista completa em um pop-up
}

// Iniciar a tela pela primeira vez
renderizar();
renderizarHistorico();
