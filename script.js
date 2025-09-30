let offset = 0;
const limit = 20;
const container = document.getElementById("pokemon-container");
const loadMoreBtn = document.getElementById("load-more");

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

// Farben für Hintergründe
function getTypeColor(type) {
  const colors = {
    fire: "#f08030", water: "#6890f0", grass: "#78c850", electric: "#f8d030",
    psychic: "#f85888", ice: "#98d8d8", dragon: "#7038f8", dark: "#705848",
    fairy: "#ee99ac", normal: "#a8a878", fighting: "#c03028", flying: "#a890f0",
    poison: "#a040a0", ground: "#e0c068", rock: "#b8a038", bug: "#a8b820",
    ghost: "#705898", steel: "#b8b8d0"
  };
  return colors[type] || "#68a090";
}

// Icon Pfad
function getTypeIcon(type) {
  return `./icons/types/${type}.svg`;
}

// Pokémon laden
async function loadPokemons() {
  loadMoreBtn.style.display = "block"; // wieder sichtbar, falls versteckt
  let response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  let data = await response.json();

  for (let pokemon of data.results) {
    await renderPokemonCard(pokemon.url);
  }
  offset += limit;
}

// Pokémon-Karten
async function renderPokemonCard(url) {
  let res = await fetch(url);
  let pokeData = await res.json();

  let card = document.createElement("div");
  card.classList.add("pokemon-card");
  card.onclick = () => openModal(pokeData);

  let types = pokeData.types.map(t => t.type.name);
  let bgColor = getTypeColor(types[0]);

  card.innerHTML = `
    <div class="pokemon-id">#${pokeData.id}</div>
    <div class="pokemon-name">${pokeData.name}</div>
    <img src="${pokeData.sprites.other['official-artwork'].front_default}" 
         class="pokemon-image" 
         style="background:${bgColor}">
    <div class="pokemon-types">
      ${types.map(t => `
        <div class="type-icon">
          <img src="${getTypeIcon(t)}" alt="${t}" class="type-img">
          ${t}
        </div>
      `).join("")}
    </div>
  `;

  container.appendChild(card);
}

// Modal
const modal = document.getElementById("pokemon-modal");
const closeModalBtn = document.getElementById("close-modal");
const modalBody = document.getElementById("modal-body");

function openModal(pokeData) {
  modal.classList.remove("hidden");
  renderModal(pokeData);
}

closeModalBtn.onclick = () => {
  modal.classList.add("hidden");
};

function renderModal(pokeData) {
  let types = pokeData.types.map(t => t.type.name);
  let bgColor = getTypeColor(types[0]);

  modalBody.innerHTML = `
    <h2>${pokeData.name} (#${pokeData.id})</h2>
    <img src="${pokeData.sprites.other['official-artwork'].front_default}" 
         style="width:200px;background:${bgColor};border-radius:20px;padding:10px">
    
    <div class="tabs">
      <div class="tab active" onclick="showTab('main', ${pokeData.id}, event)">Main</div>
      <div class="tab" onclick="showTab('stats', ${pokeData.id}, event)">Stats</div>
    </div>
    
    <div id="tab-content">
      ${renderMain(pokeData)}
    </div>
  `;
}

function renderMain(pokeData) {
  return `
    <p><b>Height:</b> ${pokeData.height}</p>
    <p><b>Weight:</b> ${pokeData.weight}</p>
    <p><b>Base Exp:</b> ${pokeData.base_experience}</p>
    <div><b>Abilities:</b></div>
    <div class="ability-list">
      ${pokeData.abilities.map(a => `
        <div class="ability-item">🎯 ${a.ability.name}</div>
      `).join("")}
    </div>
  `;
}

function renderStats(pokeData) {
  return pokeData.stats.map(s => `
    <div>
      <b>${s.stat.name}:</b>
      <div class="stat-bar">
        <div class="stat-fill" style="width:${s.base_stat / 2}%">
          ${s.base_stat}
        </div>
      </div>
    </div>
  `).join("");
}

function showTab(tab, id, event) {
  const allTabs = document.querySelectorAll(".tab");
  allTabs.forEach(t => t.classList.remove("active"));
  event.target.classList.add("active");

  fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    .then(res => res.json())
    .then(pokeData => {
      if (tab === "main") {
        document.getElementById("tab-content").innerHTML = renderMain(pokeData);
      } else {
        document.getElementById("tab-content").innerHTML = renderStats(pokeData);
      }
    });
}

// 🔎 Suchfunktion
async function searchPokemon() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) return;

  // Ergebnisliste leeren
  container.innerHTML = "";
  loadMoreBtn.style.display = "none"; // "Weitere laden" ausblenden

  try {
    let url;
    if (!isNaN(query)) {
      // Suche nach Nummer
      url = `https://pokeapi.co/api/v2/pokemon/${query}`;
    } else if (query.length >= 3) {
      // Suche nach Name
      url = `https://pokeapi.co/api/v2/pokemon/${query}`;
    } else {
      alert("Bitte mindestens 3 Buchstaben eingeben.");
      return;
    }

    let res = await fetch(url);
    if (!res.ok) {
      container.innerHTML = `<p style="color:white;text-align:center;">Kein Pokémon gefunden.</p>`;
      showAllButton();
      return;
    }
    let pokeData = await res.json();

    // Karte anzeigen
    await renderPokemonCard(`https://pokeapi.co/api/v2/pokemon/${pokeData.id}`);

    // Button "Alle" anhängen
    showAllButton();

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="color:white;text-align:center;">Fehler bei der Suche.</p>`;
    showAllButton();
  }
}

// 🔘 Button "Alle" einfügen
function showAllButton() {
  const allBtn = document.createElement("button");
  allBtn.textContent = "Alle";
  allBtn.className = "load-more";
  allBtn.onclick = resetToAll;
  container.appendChild(allBtn);
}

// 🔄 Zurück zur normalen Liste
function resetToAll() {
  container.innerHTML = "";
  offset = 0;
  loadMoreBtn.style.display = "block";
  loadPokemons();
}

// Button Listener
loadMoreBtn.addEventListener("click", loadPokemons);
searchBtn.addEventListener("click", searchPokemon);
