import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { deleteDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let historicoGlobal = [];

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
const historicoRef = collection(db, "historico");

// --- SINCRONIZAÇÃO EM TEMPO REAL ---
onSnapshot(docRef, (snap) => {
  if (snap.exists()) {
    listaCompras = snap.data().itens || [];
    renderizar(); // Desenha na tela sempre que alguém mudar algo
  }
});

onSnapshot(historicoRef, (snapshot) => {
  const historico = [];

  snapshot.forEach((doc) => {
    id: (doc.id, historico.push(doc.data()));
  });

  historicoGlobal = historico; // 🔥 salva globalmente

  renderizarHistorico(historico);
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
const inputQtd = document.querySelector("#inputQtd");
const btnLimparHistorico = document.querySelector("#btnLimparHistorico");
const quantidade = parseInt(inputQtd.value) || 1;

listaForm.addEventListener("submit", (evento) => {
  evento.preventDefault(); // IMPORTANTE: Impede a página de recarregar

  const nome = inputItem.value.trim();
  const quantidade = parseInt(inputQtd.value);
  if (nome !== "") {
    listaCompras.push({
      nome: nome,
      quantidade: quantidade > 0 ? quantidade : 1,
      comprado: false,
    });
    salvarNoFirebase();
    inputItem.value = "";
    inputQtd.value = "1"; // reseta depois de adicionar
    inputItem.focus();
    renderizar();
  }
});

/*const quantidade = parseInt(inputQtd.value) || 1;

listaCompras.push({
  nome: nome,
  quantidade: quantidade,
  comprado: false,
});
*/
// 2. CARREGAR DADOS (Busca o que está salvo ou começa com lista vazia)
//let listaCompras = JSON.parse(localStorage.getItem("minha_lista")) || [];
let listaCompras = [];

// 3. FUNÇÃO PARA RENDERIZAR (Desenhar na tela)
async function renderizar() {
  const listaUl = document.querySelector("#lista");
  listaUl.innerHTML = "";

  // 1. DESENHAR OS ITENS
  listaCompras.forEach((item, index) => {
    const li = document.createElement("li");

    // Container para o nome e preço
    const spanNome = document.createElement("span");
    //spanNome.innerText = item.nome;
    spanNome.innerText = `${item.nome} (${item.quantidade})`;

    // AQUI: Se estiver comprado, risca o SPAN do nome
    if (item.comprado) {
      spanNome.classList.add("comprado");
    }

    // AQUI: Adiciona a tag de preço se houver valor
    if (item.valor > 0) {
      const spanPreco = document.createElement("span");
      //spanPreco.innerText = `R$ ${item.valor.toFixed(2)}`;
      spanPreco.innerText = `R$ ${item.valor.toFixed(2)}
       (${item.quantidade || 1}x ${item.valorUnitario?.toFixed(2) || "0.00"})`;
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
        let preco = prompt(`Valor unitário de ${item.nome}?`, "0.00");
        //const valorUnitario = parseFloat(precoUnitario.replace(",", ".")) || 0;
        if (preco !== null) {
          const precoUnitario = parseFloat(preco.replace(",", ".")) || 0;
          item.valorUnitario = precoUnitario;
          item.valor = precoUnitario * (item.quantidade || 1);
          item.comprado = true;

          salvarNoFirebase();
        }
      } else {
        item.comprado = false;
        item.valor = 0;
        item.valorUnitario = 0;
      }
      /*
        let preco = prompt(`Qual o valor de ${item.nome}?`, "0.00");
        let precoUnitario = prompt(`Valor unitário de ${item.nome}?`, "0.00");
        
          item.valor = valorUnitario * item.quantidade;
          item.valorUnitario = valorUnitario;
          // Só marca se não cancelar o prompt
          item.valor = parseFloat(preco.replace(",", ".")) || 0;
          item.comprado = true;
          const valorUnitario = parseFloat(preco.replace(",", ".")) || 0;

          item.valorUnitario = valorUnitario;
          item.valor = valorUnitario * (item.quantidade || 1);
          salvarNoFirebase();
        }
      } else {
        item.comprado = false;
        item.valor = 0;
      }
  */
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

  /*
  //salvarNoFirebase(listaCompras);
  await addDoc(historicoRef, {
    data: new Date().toLocaleDateString("pt-BR"),
    total: listaCompras.reduce((s, i) => s + (i.valor || 0), 0),
    itensDetalhados: listaCompras,
  });
  */
}

function salvarERenderizar() {
  renderizar();
}
/*
// 4. EVENTO: ADICIONAR ITEM
btnAdicionar.onclick = () => {
  const nome = inputItem.value.trim();

  if (nome !== "") {
    listaCompras.push({ nome: nome, comprado: false });
    inputItem.value = ""; // Limpa o campo
    salvarERenderizar();
  }
};
*/
// 5. EVENTO: LIMPAR COMPRADOS (O famoso Filter!)
/*btnLimpar.onclick = () => {
  listaCompras = listaCompras.filter((item) => !item.comprado);
  salvarERenderizar();
};
*/
//let confirmarLimparHistorico = false;

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#btnLimparHistorico");
  btnLimparHistorico.onclick = async () => {
    console.log("Cliquei no limpar histórico");
    if (!confirm("Tem certeza que deseja apagar todo o histórico?")) return;

    try {
      const snapshot = await getDocs(historicoRef);

      if (snapshot.empty) {
        alert("Histórico já está vazio!");
        return;
      }

      for (const docItem of snapshot.docs) {
        await deleteDoc(docItem.ref);
      }

      console.log("Histórico apagado!");
      alert("Histórico apagado com sucesso!");
      //const promises = [];

      /*   snapshot.forEach((docItem) => {
        promises.push(deleteDoc(docItem.ref));
      });

      await Promise.all(promises);
  */
    } catch (erro) {
      console.error("Erro ao limpar histórico:", erro);
      alert("Erro ao apagar histórico.");
    }
  };
});

let confirmarFinalizacao = false;

btnFinalizar.onclick = async () => {
  console.log("Finalizar clicado", listaCompras);

  if (listaCompras.length === 0) {
    alert("Sua lista está vazia!");
    return;
  }

  if (!confirmarFinalizacao) {
    btnFinalizar.innerText = "Confirmar?";
    confirmarFinalizacao = true;

    setTimeout(() => {
      btnFinalizar.innerText = "Finalizar Compras";
      confirmarFinalizacao = false;
    }, 3000);

    return;
  }
  //const confirmacao = confirm("Deseja salvar no histórico e limpar a lista?");
  //if (confirmacao) return;

  try {
    console.log("PASSOU DO CONFIRM");

    const total = listaCompras.reduce((s, i) => s + (i.valor || 0), 0);
    //if (total === 0) return;
    console.log("Tentando salvar no Firebase...");
    //let historico = JSON.parse(localStorage.getItem("historico_compras")) || [];
    //const totalCompra = listaCompras.reduce((s, i) => s + (i.valor || 0), 0);
    await addDoc(historicoRef, {
      data: new Date().toLocaleDateString("pt-BR"),
      //total: listaCompras.reduce((s, i) => s + (i.valor || 0), 0),
      total: total,
      //itensDetalhados: listaCompras,
      itensDetalhados: JSON.parse(JSON.stringify(listaCompras)),
    });

    console.log("Salvo com sucesso!");

    /*  // Agora salvamos a CÓPIA da lista atual dentro do histórico
    historico.push({
      data: new Date().toLocaleDateString("pt-BR"),
      //total: totalCompra,
      //itens: listaCompras.length,
      total: listaCompras.reduce((s, i) => s + (i.valor || 0), 0),
      itensDetalhados: [...listaCompras], // Aqui salvamos os nomes e preços!
    });

  //localStorage.setItem("historico_compras", JSON.stringify(historico));
  listaCompras = []; // Limpa a lista atual
  salvarNoFirebase();
  renderizar();
  renderizarHistorico();
  alert("Compra salva com sucesso!");
*/ // limpa lista
    listaCompras = [];
    await salvarNoFirebase();

    alert("Compra salva com sucesso!");
  } catch (erro) {
    console.error("Erro ao salvar no Firebase:", erro);
    alert("Erro ao salvar. Veja o console.");
  }
};

function renderizarHistorico(historico) {
  //const historico = JSON.parse(localStorage.getItem("historico_compras")) || [];

  if (!historico) return;

  const listaHistoricoUl = document.querySelector("#listaHistorico");
  listaHistoricoUl.innerHTML = ""; // Limpa antes de desenhar

  // Vamos mostrar do mais novo para o mais antigo (.reverse)
  [...historico].reverse().forEach((compra, index) => {
    const li = document.createElement("li");
    li.style.cursor = "pointer"; // Muda o mouse para a mãozinha
    //li.onclick = () => abrirDetalhes(index); // Chama a função que criamos acima

    // O ?. garante que se a compra for antiga e não tiver itensDetalhados, o site não trava
    const qtdItens = compra.itensDetalhados?.length || 0;

    li.innerHTML = `
      <div>
        <strong>Data:</strong> ${compra.data} <br>
        <small>${compra.itensDetalhados?.length || 0} itens</small>
      </div>
      <strong style="color: #27ae60;">R$ ${compra.total?.toFixed(2) || "0.00"}</strong>
    `;

    // Conecta a função de abrir o Modal
    li.onclick = () => abrirDetalhes(index);

    listaHistoricoUl.appendChild(li);
  });
}

// Função para abrir o Modal com os itens
function abrirDetalhes(index) {
  //const historico = JSON.parse(localStorage.getItem("historico_compras")) || [];
  // Como usamos .reverse() na tela, precisamos pegar o índice real
  const compra = [...historicoGlobal].reverse()[index];

  if (!compra) return;

  const modal = document.querySelector("#modalDetalhes");
  const listaItens = document.querySelector("#modalListaItens");
  const totalTxt = document.querySelector("#modalTotal");

  listaItens.innerHTML = "";
  document.querySelector("#modalTitulo").innerText = `Compra: ${compra.data}`;

  compra.itensDetalhados.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${item.nome} (${item.quantidade || 1})</span>
    <strong>R$ ${item.valor?.toFixed(2) || "0.00"}</strong>`;
    listaItens.appendChild(li);
  });

  totalTxt.innerText = `Total: R$ ${compra.total?.toFixed(2) || "0.00"}`;
  modal.style.display = "flex";
}

// Fechar Modal
document.querySelector("#fecharModal").onclick = () => {
  document.querySelector("#modalDetalhes").style.display = "none";
};

// Botão Limpar Histórico
document.querySelector("#btnLimparHistorico").onclick = () => {
  if (confirm("Tem certeza que deseja apagar todo o histórico?")) {
    //localStorage.removeItem("historico_compras");
    renderizarHistorico();
  }
};

function verDetalhes(index) {
  //const historico = JSON.parse(localStorage.getItem("historico_compras")) || [];
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
//renderizarHistorico();
