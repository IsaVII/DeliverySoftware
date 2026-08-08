const STORAGE_KEY = "isLoggedIn";
const VALID_USERNAME = "admin";
const VALID_PASSWORD = "admin";

export function validateCredentials(username, password) {
  return username === VALID_USERNAME && password === VALID_PASSWORD;
}

export function getInitialLoginState() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function persistLoginState(isLoggedIn) {
  localStorage.setItem(STORAGE_KEY, isLoggedIn);
}
