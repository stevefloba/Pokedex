// Pokémon-Karte
function pokemonCardTemplate(pokeData, bgColor, types) {
    return `
    <div class="pokemon-id">#${pokeData.id}</div>
    <div class="pokemon-name">${pokeData.name}</div>
    <img src="${pokeData.sprites.other['official-artwork'].front_default}" 
         class="pokemon-image" 
         style="background:${bgColor}">
    <div class="pokemon-types">
      ${types.map(t => `
        <div class="type-icon">
          <img src="${getTypeIcon(t)}" alt="${t}" class="type-img">${t}
        </div>`).join("")}
    </div>
  `;
}

// Modal-Ansicht
function modalTemplate(pokeData, bgColor) {
    return `
    <h2>${pokeData.name} (#${pokeData.id})</h2>
    <img src="${pokeData.sprites.other['official-artwork'].front_default}" 
         style="width:200px;background:${bgColor};border-radius:20px;padding:10px">
    <div class="tabs">
      <div class="tab active" onclick="showTab('main', ${pokeData.id}, event)">Main</div>
      <div class="tab" onclick="showTab('stats', ${pokeData.id}, event)">Stats</div>
    </div>
    <div id="tab-content">${mainTabTemplate(pokeData)}</div>
    <div class="modal-arrow left" onclick="prevPokemon()">&#8592;</div>
    <div class="modal-arrow right" onclick="nextPokemon()">&#8594;</div>
  `;
}

// Main-Tab
function mainTabTemplate(pokeData) {
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

// Stats-Tab
function statsTabTemplate(pokeData) {
    return pokeData.stats.map(s => `
    <div>
      <b>${s.stat.name}:</b>
      <div class="stat-bar">
        <div class="stat-fill" style="width:${s.base_stat / 2}%">${s.base_stat}</div>
      </div>
    </div>
  `).join("");
}