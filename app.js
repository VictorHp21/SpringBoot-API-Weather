const API_URL = "http://localhost:8080/clima";
const MODO_DEMO = new URLSearchParams(location.search).has("demo");

const formulario = document.getElementById("busca");
const campo = document.getElementById("cidade");
const aviso = document.getElementById("aviso");
const painel = document.getElementById("clima");

const estado = { cidade: "", atual: null, dias: [], indice: 0, metrica: "temp", unidade: "C" };

const METRICAS = [
  ["temp", "Temperatura"],
  ["chuva", "Chuva"],
  ["vento", "Vento"]
];

const DESCRICAO = {
  sol: "Ensolarado",
  parcial: "Parcialmente nublado",
  nublado: "Nublado",
  chuva: "Chuva",
  tempestade: "Tempestade"
};

const iso = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const escapar = texto =>
  String(texto).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const graus = c => (estado.unidade === "C" ? Math.round(c) : Math.round((c * 9) / 5 + 32));

function tipoCondicao(texto = "") {
  const t = String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/tempest|trovoad|storm|thunder/.test(t)) return "tempestade";
  if (/chuv|garoa|pancada|rain|drizzle|shower|neve|snow|sleet|hail|granizo/.test(t)) return "chuva";
  if (/parcial|partial|partly|poucas nuvens|few clouds/.test(t)) return "parcial";
  if (/nublad|cloud|encoberto|overcast|nuvens/.test(t)) return "nublado";
  return "sol";
}

const SOL = `<g class="sol"><g class="raios">${Array.from(
  { length: 12 },
  (_, i) => `<rect x="30" y="3" width="4" height="9" rx="2" transform="rotate(${i * 30} 32 32)"/>`
).join("")}</g><circle cx="32" cy="32" r="14"/></g>`;

const nuvem = (cor = "") =>
  `<g class="nuvem ${cor}"><circle cx="22" cy="40" r="9"/><circle cx="34" cy="32" r="13"/><circle cx="47" cy="39" r="10"/><rect x="22" y="40" width="25" height="9"/></g>`;

const gota = (x, y, n) =>
  `<g transform="translate(${x} ${y})"><path class="gota g${n}" d="M0-5C3-1 4 1 4 3a4 4 0 0 1-8 0C-4 1-3-1 0-5z"/></g>`;

function icone(tipo) {
  const corpo = {
    sol: SOL,
    parcial: `<g transform="translate(-7 -8) scale(.8)">${SOL}</g><g transform="translate(4 6)">${nuvem()}</g>`,
    nublado: `<g transform="translate(14 -4) scale(.75)">${nuvem("escura")}</g><g transform="translate(-2 4)">${nuvem("cinza")}</g>`,
    chuva: `<g transform="translate(0 -6)">${nuvem("cinza")}</g>${gota(22, 54, 1)}${gota(34, 57, 2)}${gota(46, 54, 3)}`,
    tempestade: `<g transform="translate(0 -8)">${nuvem("escura")}</g><polygon class="raio" points="35,40 27,53 33,53 30,62 41,47 35,47 38,40"/>`
  }[tipo];
  return `<svg viewBox="0 0 64 64" aria-hidden="true">${corpo}</svg>`;
}

function normalizar(json, cidade) {
  const hoje = iso(new Date());
  const dias = (json.diasSemana || [])
    .map(d => ({
      data: String(d.date).slice(0, 10),
      max: d.tempmax,
      min: d.tempmin,
      chuva: d.possibilidadeChuva,
      umidade: d.umidade,
      vento: d.velocidadeVento,
      condicao: d.conditions
    }))
    .filter(d => d.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 7);
  const atual =
    json.temperatura != null
      ? {
          temperatura: json.temperatura,
          umidade: json.umidade,
          vento: json.velocidadeVento,
          chuva: json.possibilidadeChuva,
          condicao: json.description
        }
      : null;
  return { cidade: json.cidade || cidade, atual, dias };
}

function demo(cidade) {
  const base = [
    [27, 16, "Predominantemente ensolarado", 0, 14],
    [29, 17, "Ensolarado", 0, 12],
    [32, 19, "Ensolarado", 5, 10],
    [33, 22, "Parcialmente nublado", 10, 13],
    [32, 21, "Nublado", 20, 15],
    [29, 19, "Chuva", 70, 22],
    [29, 21, "Nublado", 30, 17]
  ];
  const hoje = new Date();
  return {
    cidade,
    atual: { temperatura: 27, umidade: 45, vento: 14, chuva: 0, condicao: base[0][2] },
    dias: base.map(([max, min, condicao, chuva, vento], i) => {
      const d = new Date(hoje);
      d.setDate(d.getDate() + i);
      return { data: iso(d), max, min, chuva, umidade: 45 + i * 4, vento, condicao };
    })
  };
}

async function buscar(cidade) {
  if (MODO_DEMO) return demo(cidade);
  const resposta = await fetch(`${API_URL}?cidade=${encodeURIComponent(cidade)}`);
  if (resposta.status === 404) throw new Error("nao-encontrada");
  if (!resposta.ok) throw new Error("falha");
  return resposta.json();
}

function caminho(pontos) {
  if (pontos.length === 1) return `M${pontos[0][0]} ${pontos[0][1]}`;
  return pontos.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x} ${y}`;
    const [x0, y0] = pontos[i - 1];
    const meio = (x - x0) / 2;
    return `${d} C${x0 + meio} ${y0} ${x - meio} ${y} ${x} ${y}`;
  }, "");
}

function valoresDaMetrica() {
  const { dias, metrica } = estado;
  if (metrica === "temp") return { principal: dias.map(d => graus(d.max)), secundaria: dias.map(d => graus(d.min)), sufixo: "°" };
  if (metrica === "chuva") return { principal: dias.map(d => d.chuva ?? 0), secundaria: null, sufixo: "%" };
  return { principal: dias.map(d => d.vento ?? 0), secundaria: null, sufixo: " km/h" };
}

function desenharGrafico(animar) {
  const n = estado.dias.length;
  const { principal, secundaria, sufixo } = valoresDaMetrica();
  const todos = principal.concat(secundaria || []);
  const menor = Math.min(...todos);
  const maior = Math.max(...todos);
  const y = v => 24 + (1 - (v - menor) / (maior - menor || 1)) * 64;
  const ponto = (v, i) => [i * 100 + 50, y(v)];

  const linha = principal.map(ponto);
  const tracado = caminho(linha);
  const area = `${tracado} L${linha[n - 1][0]} 100 L${linha[0][0]} 100 Z`;
  const minima = secundaria ? `<path class="linha linha--min" d="${caminho(secundaria.map(ponto))}"/>` : "";

  const rotulos = principal
    .map(
      (v, i) =>
        `<span class="pt${i === estado.indice ? " sel" : ""}" style="left:${((i + 0.5) / n) * 100}%;top:${y(v)}%"><i></i><b>${v}${sufixo}</b></span>`
    )
    .join("");

  const grafico = document.getElementById("grafico");
  grafico.classList.toggle("parado", !animar);
  grafico.innerHTML = `<svg viewBox="0 0 ${n * 100} 100" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".26"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
    <path class="area" d="${area}"/>${minima}<path class="linha" d="${tracado}"/></svg>${rotulos}`;
}

function cabecalho() {
  const d = estado.dias[estado.indice];
  const ehHoje = d.data === iso(new Date());
  const a = estado.indice === 0 && estado.atual ? estado.atual : {};
  const condicao = a.condicao ?? d.condicao;
  const tipo = tipoCondicao(condicao);
  const data = new Date(`${d.data}T00:00:00`);

  const quando = ehHoje
    ? `${data.toLocaleDateString("pt-BR", { weekday: "long" })}, ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
    : data.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" });

  painel.dataset.tema = tipo;
  document.getElementById("icone").innerHTML = icone(tipo);
  document.getElementById("temp").textContent = graus(a.temperatura ?? d.max);
  const mostrar = (id, v, unidade) => {
    const el = document.getElementById(id);
    el.textContent = v == null ? "" : `${Math.round(v)}${unidade}`;
    el.parentElement.hidden = v == null;
  };
  mostrar("d-chuva", a.chuva ?? d.chuva, "%");
  mostrar("d-umidade", a.umidade ?? d.umidade, "%");
  mostrar("d-vento", a.vento ?? d.vento, " km/h");
  document.getElementById("quando").textContent = quando;
  document.getElementById("condicao").textContent = DESCRICAO[tipo];
}

function selecionar(i) {
  estado.indice = i;
  painel.querySelectorAll(".dia").forEach((b, j) => {
    b.classList.toggle("ativo", j === i);
    b.setAttribute("aria-pressed", j === i);
  });
  painel.querySelectorAll(".pt").forEach((p, j) => p.classList.toggle("sel", j === i));
  cabecalho();
}

function montar(animar) {
  const n = estado.dias.length;
  const abas = METRICAS.filter(([id]) => id === "temp" || estado.dias.some(d => d[id] != null)).map(
    ([id, nome]) => `<button type="button" role="tab" data-m="${id}" aria-selected="${id === estado.metrica}">${nome}</button>`
  ).join("");

  const dias = estado.dias
    .map((d, i) => {
      const nome = new Date(`${d.data}T00:00:00`).toLocaleDateString("pt-BR", { weekday: "short" });
      return `<button type="button" class="dia" data-i="${i}" aria-pressed="false">
        <span class="dia__nome">${nome}</span>${icone(tipoCondicao(d.condicao))}
        <span class="dia__temps"><b>${graus(d.max)}°</b><span>${graus(d.min)}°</span></span></button>`;
    })
    .join("");

  painel.innerHTML = `<div class="ceu" aria-hidden="true"></div>
    <header class="topo">
      <div class="agora">
        <div class="icone" id="icone"></div>
        <div class="temp"><span id="temp"></span>
          <div class="unidade" role="group" aria-label="Unidade de temperatura">
            <button type="button" data-u="C" class="${estado.unidade === "C" ? "on" : ""}">°C</button>
            <button type="button" data-u="F" class="${estado.unidade === "F" ? "on" : ""}">°F</button>
          </div>
        </div>
        <ul class="detalhes">
          <li>Chuva: <span id="d-chuva"></span></li>
          <li>Umidade: <span id="d-umidade"></span></li>
          <li>Vento: <span id="d-vento"></span></li>
        </ul>
      </div>
      <div class="local">
        <h2>${escapar(estado.cidade)}</h2>
        <p id="quando"></p>
        <p id="condicao"></p>
      </div>
    </header>
    <div class="abas" role="tablist">${abas}</div>
    <div class="faixa"><div class="faixa__interno" style="--n:${n}">
      <div class="grafico" id="grafico"></div>
      <div class="dias">${dias}</div>
    </div></div>`;

  painel.hidden = false;
  desenharGrafico(animar);
  selecionar(estado.indice);
}

painel.addEventListener("click", e => {
  const alvo = e.target.closest("button");
  if (!alvo) return;
  if (alvo.dataset.i !== undefined) {
    selecionar(Number(alvo.dataset.i));
  } else if (alvo.dataset.m) {
    estado.metrica = alvo.dataset.m;
    painel.querySelectorAll(".abas button").forEach(b => b.setAttribute("aria-selected", b === alvo));
    desenharGrafico(true);
  } else if (alvo.dataset.u && alvo.dataset.u !== estado.unidade) {
    estado.unidade = alvo.dataset.u;
    montar(false);
    painel.querySelector(`[data-u="${estado.unidade}"]`).focus();
  }
});

formulario.addEventListener("submit", async e => {
  e.preventDefault();
  const cidade = campo.value.trim();
  if (!cidade) return;

  aviso.textContent = "Consultando…";
  painel.setAttribute("aria-busy", "true");

  try {
    const dados = normalizar(await buscar(cidade), cidade);
    if (!dados.dias.length) throw new Error("nao-encontrada");
    Object.assign(estado, dados, { indice: 0, metrica: "temp" });
    aviso.textContent = "";
    montar(true);
  } catch (erro) {
    painel.hidden = true;
    aviso.textContent =
      erro.message === "nao-encontrada"
        ? "Cidade não encontrada. Confira o nome e tente de novo."
        : `Não foi possível consultar o clima. Verifique se a API está rodando em ${API_URL}.`;
  } finally {
    painel.removeAttribute("aria-busy");
  }
});