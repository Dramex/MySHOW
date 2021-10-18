const api_key = "bacc4e488075d44f82b8e0dcd623c34a";
const searchResults = document.getElementById("searchResults");
const data = document.getElementById("data");

// debounce to avoid spam apis
const debounce = (func, wait, immediate) => {
    let timeout;
  
    return function executedFunction() {
      let context = this;
      let args = arguments;
          
      let later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
  
      let callNow = immediate && !timeout;
      
      clearTimeout(timeout);
  
      timeout = setTimeout(later, wait);
      
      if (callNow) func.apply(context, args);
    };
};

// search function 
const search = debounce((term) => {
    console.log("term",term, Boolean(term));

    if(!term) return searchResults.classList.remove("show");
    searchResults.classList.add("show");

    fetch(`https://api.themoviedb.org/3/search/multi?api_key=${api_key}&language=en-US&query=${term}&page=1&include_adult=false`, {
        method: 'GET',
        redirect: 'follow'
        })
    .then(response => response.json())
    .then(result => {
        
        searchResults.innerHTML = '';
        result.results.forEach(element => {
            let node = document.createElement("li")
            node.innerHTML = `

            <div class="searchElement" onclick="info('${element.media_type}-${element.id}')">
                        <div class="row g-0">
                          <div class="col-auto">
                            <img onerror="this.onerror=null;this.src='http://underscoremusic.co.uk/site/wp-content/uploads/2014/05/no-poster.jpg';" src="https://www.themoviedb.org/t/p/w440_and_h660_face/${element.poster_path}" width="100px" class="img-fluid" alt="${element.extended_title || element.name}">
                          </div>
                          <div class="col-md-9">
                            <div style="padding: 10px;">
                              <h5 class="card-title">${element.title || element.name}</h5>
                              <p class="card-text" id="searchDescription">${element.overview}</p>
                              <p class="card-text"><small class="text-muted">${element.year || ''}</small></p>
                            </div>
                          </div>
                        </div>
            </div>

            `;
            searchResults.appendChild(node);
        });
    })
    .catch(error => console.log('error', error));
}, 250);

// get info of movie / series

const info = (num) => {
    if(!num.startsWith("movie") && !num.startsWith("tv")) return;
    window.location.hash = num;
    searchResults.classList.remove("show");

    data.innerHTML = `<div class="lds-ripple"><div></div><div></div></div>`;


    fetch(`https://api.themoviedb.org/3/${num.split("-")[0]}/${num.split("-")[1]}?api_key=${api_key}&language=en-US`, {
        method: 'GET',
        redirect: 'follow'
        })
    .then(response => response.json())
    .then(result => {
        let name = result.title || result.name || result.original_title;
        document.getElementById("title").innerText =  name;
        if(result.tagline) document.getElementById("tagline").innerText = result.tagline;
        document.getElementById("header").style = `
        background: linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url('https://www.themoviedb.org/t/p/w1920_and_h800_multi_faces/${result.backdrop_path}') no-repeat center center fixed;
        background-size: cover;
        `;
        
        data.innerHTML = `
        <h1>${name}</h1>
        `;
    })



}

const load = () => {
  let hash = window.location.hash.substring(1);
  if(hash) return info(hash);

  document.getElementById("title").innerText =  'Explore';
  document.getElementById("tagline").innerText = '';
  document.getElementById("header").style = `
  background: linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url('./images/endgame.jpg') no-repeat center center fixed;
  background-size: cover;
  `
  

  data.innerHTML = `<h1>What's Popular</h1>
  <div id="top_moives" class="row row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-2"></div>
  `;

  fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_watch_monetization_types=flatrate`, 
  {
    method: 'GET',
    redirect: 'follow'
  })
    .then(response => response.json())
    .then(result => {
      result.results.forEach(element => {
        let node = document.createElement("div");
        node.classList.add("row");
        node.innerHTML = `
        <img onclick="info('movie-${element.id}')" class="poster" src="https://www.themoviedb.org/t/p/w440_and_h660_face/${element.poster_path}" />
        `;
        document.getElementById("top_moives").appendChild(node);
      })
    })
    .catch(error => console.log('error', error));


}

window.onload = () => load();
window.onhashchange = () => load();