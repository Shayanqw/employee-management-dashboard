import { http } from "./httpClient";

export async function getEmployees(signal) {
  const res = await http.get("/employees", { signal });
  return res.data;
}

export async function searchEmployees(query, signal) {
  const res = await http.get("/employees/search", {
    params: { q: query },
    signal,
  });
  return res.data;
}

export async function createEmployee(payload) {
  const res = await http.post("/employees", payload);
  return res.data;
}

export async function updateEmployee(id, payload) {
  const res = await http.put(`/employees/${id}`, payload);
  return res.data;
}

export async function deleteEmployee(id) {
  const res = await http.delete(`/employees/${id}`);
  return res.data;
}

export async function healthCheck(signal) {
  const res = await http.get("/health", { signal });
  return res.data;
}
