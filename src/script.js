const api_key = "bacc4e488075d44f82b8e0dcd623c34a";
const searchResults = document.getElementById("searchResults");
const data = document.getElementById("data");
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

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

    data.innerHTML = `<div class="text-center">
       <div class="lds-ripple"><div></div><div></div></div>
    </div>`;


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
        <div class="row">
        <div class="col-xl-3 col-lg-6">
          <div class="card card-stats mb-4 mb-xl-0">
            <div class="card-body">
              <div class="row">
                <div class="col">
                  <h5 class="card-title text-uppercase text-muted mb-0">Status</h5>
                  <span class="h3 font-weight-bold mb-0">${result.status}</span>
                </div>
                <div class="col-auto">
                  <div class="icon icon-shape bg-danger text-white rounded-circle shadow">
                    <i class="fas fa-question"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6">
          <div class="card card-stats mb-4 mb-xl-0">
            <div class="card-body">
              <div class="row">
                <div class="col">
                <h5 class="card-title text-uppercase text-muted mb-0">${type === "movie" ? "Budget" : "Seasons"}</h5>
                <span class="h3 font-weight-bold mb-0">${type === "movie" ? "$" + result.budget.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : result.number_of_seasons}</span>
                </div>
                <div class="col-auto">
                  <div class="icon icon-shape bg-warning text-white rounded-circle shadow">
                    <i class="fas fa-${type === "movie" ? "money-check-alt" : "list"}"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6">
          <div class="card card-stats mb-4 mb-xl-0">
            <div class="card-body">
              <div class="row">
                <div class="col">
                  <h5 class="card-title text-uppercase text-muted mb-0">${type === "movie" ? "Revenue" : "Episodes"}</h5>
                  <span class="h3 font-weight-bold mb-0">${type === "movie" ? "$" + result.revenue?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : result.number_of_episodes}</span>
                </div>
                <div class="col-auto">
                  <div class="icon icon-shape bg-yellow text-white rounded-circle shadow">
                    <i class="fas fa-${type === "movie" ? "money-bill-wave" : "eye"}"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6">
          <div class="card card-stats mb-4 mb-xl-0">
            <div class="card-body">
              <div class="row">
                <div class="col">
                  <h5 class="card-title text-uppercase text-muted mb-0">Language</h5>
                  <span class="h3 font-weight-bold mb-0">${result.spoken_languages[0].name}</span>
                </div>
                <div class="col-auto">
                  <div class="icon icon-shape bg-info text-white rounded-circle shadow">
                    <i class="fas fa-language"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mb-3 mt-3">
      ${loggedUser ? `
      <button type="button" class="btn btn-primary" onclick="watch(${id}, '${type}', '${result.poster_path}');" ${loggedUser.list.find(f => f.type === type && f.id === parseInt(id)) ? "disabled" : ""}><i class="fas fa-clock"></i> Add to Watchlist</button>
      <button type="button" class="btn btn-warning" onclick="watch(${id}, '${type}', '${result.poster_path}', true);" ${loggedUser.list.find(f => f.type === type && f.id === parseInt(id) && f.watched) ? "disabled" : ""}> <i class="fas fa-eye"></i> Watched</button>
      ` : ``}

      </div>
        <h1 class="mt-3">Overview</h1>
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

const watchList = () => {
  document.getElementById("title").innerText =  'Watchlist';
  if(!loggedUser) return data.innerText = `<h1> Login to see this page. </h1>`
  data.innerHTML = `<h1>Watch list</h1>`;
  if(loggedUser.list.some(g => !g.watched)) {
    data.innerHTML += `<div id="top_moives" class="row row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-2">
</div>

<div id="top_moives" class="row row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-2">
      ${loggedUser.list.filter(g => !g.watched).map(v => `<div class="col watch" >
      <button type="button" onclick="deleteFromList('${v.type}','${v.id}')" class="btn-close" aria-label="Close"></button>
    <img class="poster" height="300px" onclick="info('${v.type}-${v.id}')" src="https://www.themoviedb.org/t/p/w440_and_h660_face/${v.poster_path}">

    </div>`).join(" ")}
</div>`;
  } else {
    data.innerHTML += `<h4>No items in the watch list.</h4>`
  }

  data.innerHTML += `<h1>Watched</h1>`;
  if(loggedUser.list.some(g => g.watched)) {
    data.innerHTML += `<div id="top_moives" class="row row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-2">

    ${loggedUser.list.filter(g => g.watched).map(v => `<div class="col watch" >
      <button type="button" onclick="deleteFromList('${v.type}','${v.id}')" class="btn-close" aria-label="Close"></button>
    <img class="poster" height="300px" onclick="info('${v.type}-${v.id}')" src="https://www.themoviedb.org/t/p/w440_and_h660_face/${v.poster_path}">

    </div>`).join(" ")}

</div>

<div id="top_moives" class="row row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-2">
  
</div>`;
  } else {
    data.innerHTML += `<h4>No items in the watch list.</h4>`
  }
  
};
const load = async () => {
  let hash = window.location.hash.substring(1);
  if(hash === "watchlist") return watchList();
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

window.onload = async () => {
  // check token then login
  if(localStorage.account) await tokenLogin(localStorage.account);

  load();

}
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

let loggedUser = null;
const tokenLogin = async (token) => {
  console.log("Login with token", token);

  localStorage.account = token;
  document.getElementById("loginNav").classList.add("hidden");
  document.getElementById("registerNav").classList.add("hidden");
  document.getElementById("userNav").classList.remove("hidden");

  return fetch(`https://us-central1-myshow-6fbe8.cloudfunctions.net/data/user/${token}`)
  .then(response => response.json())
  .then(data => {
    loggedUser = data;
    document.getElementById("usernameNav").innerText = data.name;
    loginModal.hide();
  });


};

const deleteFromList = (type, id) => {
  fetch('https://us-central1-myshow-6fbe8.cloudfunctions.net/data/watch', {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json',
      'authorization': localStorage.account
    },
    body: JSON.stringify({
      id, type
    })
  })
  .then(response => response.json())
  .then(data => {
    
    loggedUser.list = data.list;
    watchList();
  });
}
const watch = (id, type, poster_path, watched = false) => {
  fetch(`https://us-central1-myshow-6fbe8.cloudfunctions.net/data/watch`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'authorization': localStorage.account
    },
    body: JSON.stringify({
      id, type, watched, poster_path
    })
  })
  .then(response => response.json())
  .then(data => {

    console.log("watch", data);
    loggedUser.list = data.list;
    info(`${type}-${id}`);
  });

}
const logout = () => {
  Toast.fire({
    icon: 'success',
    title: 'Signed out successfully'
  })
  localStorage.account = null;
  document.getElementById("loginNav").classList.remove("hidden");
  document.getElementById("registerNav").classList.remove("hidden");
  document.getElementById("userNav").classList.add("hidden");
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
      if(data.error) return alertDIV.innerHTML = `<div class="alert alert-danger" role="alert">${data.error}</div>`;
      if(data.token) tokenLogin(data.token);
    
      Toast.fire({
        icon: 'success',
        title: 'Signed up successfully'
      })

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
      if(data.error) return alertDIV.innerHTML = `<div class="alert alert-danger" role="alert">
      Wrong email or password!
    </div>`;
    if(data.token) tokenLogin(data.token);
    Toast.fire({
      icon: 'success',
      title: 'Signed in successfully'
    })
    
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
