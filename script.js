async function fetchDataJson() {
    let response = await fetch("https://pokeapi.co/api/v2/pokemon/1");
    let responseAsJason = await response.json();
    console.log(responseAsJason);

   
}