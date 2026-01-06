import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

test("renders navbar and home route", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText(/Employee Manager/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /^Home$/i })).toBeInTheDocument();

  // Home page also has "Open Employees Dashboard" — be precise:
  expect(screen.getByRole("link", { name: /^Employees$/i })).toBeInTheDocument();
});
