import { render, screen } from "@testing-library/react";
import LoginPage from "../app/login/page";

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    login: jest.fn(),
    currentUser: null,
  }),
}));

describe("Login Page", () => {
  test("renderiza el formulario", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("button", { name: /iniciar sesión/i })
    ).toBeInTheDocument();
  });
});
