import '@babel/polyfill' //so it can work on older browsers ... its to polyfill some of the fixture of JS
import { displayMap } from './mapbox';
import { login, logout } from "./login";


//DOM ELEMENTS first with this to test if it actually exist before executing the locations variable code in Delegations
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form')
const logOutBtn = document.querySelector('.nav__el--logout')

//VALUES


//DELEGATIONS
if(mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations)
console.log(locations)
}

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
     login(email, password);
    })
} 
 if (logOutBtn) {
    logOutBtn.addEventListener('click', logout)
 }
   