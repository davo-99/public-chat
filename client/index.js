(() => {

  const popupUsername = document.getElementById('popup-username');
  const popupStatus = document.getElementById('popup-status');
  const popupButton = document.getElementById('popup-button');
  const error = document.querySelector("#error");

  const baseURL = url =>
    url.match(/^.+?[^\/:](?=[?\/]|$)/g).shift();

  const userExists = async username => {
    const response = await fetch(baseURL(location.href) + '/exists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    });
    return response.json();
  }

  popupUsername.onkeydown = e => {
    popupUsername.classList.remove('error');
    error.innerHTML = '';
    e.key === 'Enter' && popupStatus.focus();
  }

  popupStatus.onkeydown = e => {
    e.key === 'Enter' && popupButton.click();
  }

  popupButton.onclick = () => {
    const username = popupUsername.value;
    const status = popupStatus.value;
    if (!username.length) {
      error.innerHTML = 'Username must be filled';
      popupUsername.classList.add('error');
      return;
    }
    userExists(username)
      .then(exists => {
        if (!exists) {
          sessionStorage.setItem('username', username);
          sessionStorage.setItem('status', status);
          location.assign(location.href + 'chat');
        }
        else {
          error.innerHTML = 'User already exists';
          popupUsername.classList.add('error');
        }
      });
  }

  window.onload = () => {
    popupUsername.focus();
  }

})();