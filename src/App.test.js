import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  window.history.pushState(
    {},
    "",
    "/uniqare-control-panel-9x7/login"
  );
});

test("renders the secure admin login page", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  expect(
    screen.getByRole("heading", {
      name: /uniqare admin/i,
    })
  ).toBeInTheDocument();

  expect(
    screen.getByRole("button", {
      name: /login/i,
    })
  ).toBeInTheDocument();
});
