export function isAuthed() {
  return Boolean(localStorage.getItem("demo_auth_token"));
}

export function loginDemoToken(token = "demo-token") {
  localStorage.setItem("demo_auth_token", token);
}

export function logout() {
  localStorage.removeItem("demo_auth_token");
}
