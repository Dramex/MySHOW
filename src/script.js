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
    let type = num.split("-")[0];
    let id = num.split("-")[1];
    window.location.hash = num;
    searchResults.classList.remove("show");

    data.innerHTML = `<div class="lds-ripple"><div></div><div></div></div>`;


    Promise.all([
      // get  details
      fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${api_key}&language=en-US`, {
        method: 'GET',
        redirect: 'follow'
      }).then(response => response.json()),
      // get credits
      fetch(`https://api.themoviedb.org/3/${type}/${id}/credits?api_key=${api_key}&language=en-US`, {
          method: 'GET',
          redirect: 'follow'
      }).then(response => response.json()),
      // get watch providers
      fetch(`https://api.themoviedb.org/3/${type}/${id}/watch/providers?api_key=${api_key}&language=en-US`, {
        method: 'GET',
        redirect: 'follow'
      })
  .then(response => response.json())
])
    .then(values => {
        const result = values[0];
        const cast = values[1].cast;

        let name = result.title || result.name || result.original_title;
        document.getElementById("title").innerText =  name;
        if(result.tagline) document.getElementById("tagline").innerText = result.tagline;
        document.getElementById("header").style = `
        background: linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url('https://www.themoviedb.org/t/p/w1920_and_h800_multi_faces/${result.backdrop_path}') no-repeat center center fixed;
        background-size: cover;
        `;
        
        data.innerHTML = `
        <h1>Overview</h1>
        <h4>${result.overview}</h4><br>
        <h1>Top Cast</h1>
        <div class="row row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-2">
          ${cast.filter(ch => ch.profile_path).map(ch => `
          <div class="col">
          <div class="card mb-3" style="max-width: 540px;">
  <div class="row g-0">
    <div class="col-md-4">
      <img src="https://www.themoviedb.org/t/p/w276_and_h350_face/${ch.profile_path}" class="img-fluid rounded-start" alt="...">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title">${ch.name}</h5>
        <p class="card-text"><small class="text-muted">${ch.character}</small></p>
      </div>
    </div>
  </div>
</div>

  
          </div>`).join(" ")}
        </div>
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


// vaildations 
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'), {
  keyboard: false
})
let signUp = true;
const alertDIV = document.getElementById("alertDIV");
const saveButton = document.getElementById("modalSave");
const password = document.getElementById("password");
const confirm_password = document.getElementById("confirm_password");
const email = document.getElementById("email");
const Name = document.getElementById("name");

const tokenLogin = (token) => {
  console.log("Login with token", token);

  localStorage.account = token;
  document.getElementById("loginNav").classList.add("hidden");
  document.getElementById("registerNav").classList.add("hidden");
  document.getElementById("logoutNav").classList.remove("hidden");

  loginModal.hide();
};

const logout = () => {
  localStorage.account = null;
  document.getElementById("loginNav").classList.remove("hidden");
  document.getElementById("registerNav").classList.remove("hidden");
  document.getElementById("logoutNav").classList.add("hidden");
}

const signup = () => {
  signUp = true;
  document.getElementById("modalTitle").innerText = "Sign Up";
  saveButton.innerText = "Sign Up";
  saveButton.onclick = () => {
    fetch('https://us-central1-myshow-6fbe8.cloudfunctions.net/data/register', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        name: Name.value
      }) 
    })
    .then(response => response.json())
    .then(data => {
      if(data.error) alertDIV.innerHTML = `<div class="alert alert-danger" role="alert">${data.error}</div>`;
      if(data.token) tokenLogin(data.token);
    
    }).catch(e => {
      alertDIV.innerHTML = `<div class="alert alert-danger" role="alert">
      Timeout !
    </div>`;
    });

    
  }
  document.getElementById("nameEl").classList.remove("hidden");
  document.getElementById("cpEl").classList.remove("hidden");
  document.getElementById("rememberEl").classList.add("hidden");
}
const signin = () => {
  signUp = false;
  document.getElementById("modalTitle").innerText = "Sign In";
  saveButton.innerText = "Sign In";
  saveButton.onclick = () => {
    console.log("SEND LOGIN REQUEST");
    fetch('https://us-central1-myshow-6fbe8.cloudfunctions.net/data/login', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      body: JSON.stringify({
        email: email.value,
        password: password.value
      }) 
    })
    .then(response => response.json())
    .then(data => {
      if(data.error) alertDIV.innerHTML = `<div class="alert alert-danger" role="alert">
      Wrong email or password!
    </div>`;
    if(data.token) tokenLogin(data.token);
      console.log(data);
    
    }).catch(e => {
      alertDIV.innerHTML = `<div class="alert alert-danger" role="alert">
      Timeout !
    </div>`;
    });

    
  }
  document.getElementById("nameEl").classList.add("hidden");
  document.getElementById("cpEl").classList.add("hidden");
  document.getElementById("rememberEl").classList.remove("hidden");
}

email.onchange = () => {
  console.log(email.value);
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.value)) {
    return email.classList.remove("is-invalid");
  }
  return email.classList.add("is-invalid")
}

function match(){
  if(!signUp) return;
  if(confirm_password.value && password.value !== confirm_password.value) return confirm_password.classList.add("is-invalid")
  return confirm_password.classList.remove("is-invalid")
}
confirm_password.addEventListener("keyup", match);
password.addEventListener("keyup", match);
