let offset = 0;
const limit = 20;
const container = document.getElementById("pokemon-container");
const loadMoreBtn = document.getElementById("load-more");
const buttonsContainer = document.getElementById("buttons-container");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

let allPokemonList = [];
let searchResults = [];
let searchOffset = 0;
let isSearching = false;

let displayedPokemons = []; // aktuell sichtbare Pokémon für Modal
let currentIndex = null;    // Index für Modal Navigation

// Farben & Icons
function getTypeColor(type) {
  const colors = {
    fire: "#f08030", water: "#6890f0", grass: "#78c850", electric: "#f8d030",
    psychic: "#f85888", ice: "#98d8d8", dragon: "#7038f8", dark: "#705848", fairy: "#ee99ac",
    normal: "#a8a878", fighting: "#c03028", flying: "#a890f0", poison: "#a040a0", ground: "#e0c068",
    rock: "#b8a038", bug: "#a8b820", ghost: "#705898", steel: "#b8b8d0"
  };
  return colors[type] || "#68a090";
}

function getTypeIcon(type) {
  return `./icons/types/${type}.svg`;
}

// Pokémon laden
async function loadPokemons() {
  loadMoreBtn.style.display = "block";
  let res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  let data = await res.json();

  for (let i = 0; i < data.results.length; i++) {
    await renderPokemonCard(data.results[i].url, offset + i);
  }
  offset += limit;
}

// Karte rendern
async function renderPokemonCard(url, indexInList = null) {
  let res = await fetch(url);
  let pokeData = await res.json();

  if (indexInList !== null) displayedPokemons[indexInList] = pokeData;

  let types = pokeData.types.map(t => t.type.name);
  let bgColor = getTypeColor(types[0]);

  let card = document.createElement("div");
  card.classList.add("pokemon-card");
  card.onclick = () => openModal(pokeData);

  card.innerHTML = pokemonCardTemplate(pokeData, bgColor, types);
  container.appendChild(card);
}

// Modal
const modal = document.getElementById("pokemon-modal");
const closeModalBtn = document.getElementById("close-modal");
const modalBody = document.getElementById("modal-body");

function openModal(pokeData) {
  modal.classList.remove("hidden");
  document.body.style.overflow = 'hidden';
  currentIndex = displayedPokemons.findIndex(p => p.id === pokeData.id);
  renderModal(pokeData);
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = 'auto';
}

closeModalBtn.onclick = closeModal;
modal.onclick = (e) => { if (e.target === modal) closeModal(); };

// Modal rendern
function renderModal(pokeData) {
  let types = pokeData.types.map(t => t.type.name);
  let bgColor = getTypeColor(types[0]);

  modalBody.innerHTML = modalTemplate(pokeData, bgColor);

  const left = modalBody.querySelector('.modal-arrow.left');
  const right = modalBody.querySelector('.modal-arrow.right');
  left.classList.toggle('disabled', currentIndex <= 0);
  right.classList.toggle('disabled', currentIndex >= displayedPokemons.length - 1);
}

// Navigation
function prevPokemon() {
  if (currentIndex > 0) { currentIndex--; renderModal(displayedPokemons[currentIndex]); }
}
function nextPokemon() {
  if (currentIndex < displayedPokemons.length - 1) { currentIndex++; renderModal(displayedPokemons[currentIndex]); }
}

// Main/Stats Tabs
function renderMain(pokeData) {
  return mainTabTemplate(pokeData);
}
function renderStats(pokeData) {
  return statsTabTemplate(pokeData);
}
function showTab(tab, id, event) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  event.target.classList.add("active");
  fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(r => r.json()).then(p => {
    document.getElementById("tab-content").innerHTML = (tab === 'main') ? renderMain(p) : renderStats(p);
  });
}

// Suche
async function loadAllPokemonList() {
  if (allPokemonList.length === 0) {
    let res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10000");
    let data = await res.json();
    allPokemonList = data.results;
  }
}

const searchMessage = document.getElementById("search-message");

async function searchPokemon() {
  const query = searchInput.value.trim().toLowerCase();
  searchMessage.textContent = ""; // alte Meldung zurücksetzen

  if (!query) return;

  container.innerHTML = "";
  loadMoreBtn.style.display = "none";
  removeAllButton();

  try {
    if (!isNaN(query)) {
      let url = `https://pokeapi.co/api/v2/pokemon/${query}`;
      await renderPokemonCard(url);
      showAllButton();
    } else if (query.length >= 3) {
      await loadAllPokemonList();
      searchResults = allPokemonList.filter(p => p.name.includes(query));
      searchOffset = 0;
      isSearching = true;

      if (searchResults.length === 0) {
        container.innerHTML = `<p style="color:white;text-align:center;">Kein Pokémon gefunden.</p>`;
        showAllButton();
      } else loadSearchResults();
    } else {
      searchMessage.textContent = "Bitte mindestens 3 Buchstaben eingeben.";
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="color:white;text-align:center;">Fehler bei der Suche.</p>`;
    showAllButton();
  }
}

async function loadSearchResults() {
  const slice = searchResults.slice(searchOffset, searchOffset + limit);
  for (let match of slice) {
    await renderPokemonCard(match.url);
  }
  searchOffset += limit;
  if (searchOffset < searchResults.length) {
    loadMoreBtn.style.display = "block";
    loadMoreBtn.onclick = loadSearchResults;
  } else loadMoreBtn.style.display = "none";
  showAllButton();
}

// Alle Button
function showAllButton() {
  if (document.getElementById("all-btn")) return;
  const allBtn = document.createElement("button");
  allBtn.id = "all-btn";
  allBtn.textContent = "Alle";
  allBtn.className = "load-more";
  allBtn.onclick = resetToAll;
  buttonsContainer.appendChild(allBtn);
}

function removeAllButton() {
  const oldBtn = document.getElementById("all-btn");
  if (oldBtn) oldBtn.remove();
}

function resetToAll() {
  container.innerHTML = "";
  offset = 0; searchResults = []; searchOffset = 0; isSearching = false;
  removeAllButton();
  loadMoreBtn.style.display = "block";
  loadMoreBtn.onclick = loadPokemons;
  loadPokemons();
}

loadMoreBtn.addEventListener("click", loadPokemons);
searchBtn.addEventListener("click", searchPokemon);
