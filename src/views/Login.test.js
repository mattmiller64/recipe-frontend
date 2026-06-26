import { shallowMount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "./Login.vue";
import UserServices from "../services/UserServices.js";

const mockRouter = { push: vi.fn() };

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: () => mockRouter,
  };
});

vi.mock("../services/UserServices.js", () => ({
  default: {
    loginUser: vi.fn(),
    addUser: vi.fn(),
  },
}));

describe("Login.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mockRouter.push.mockReset();
  });

  it("logs in a user and navigates to recipes", async () => {
    UserServices.loginUser.mockResolvedValue({
      data: { id: 50, token: "fake-token" },
    });

    const wrapper = shallowMount(Login);
    wrapper.vm.user.email = "alice@example.com";
    wrapper.vm.user.password = "password";

    await wrapper.vm.login();
    await flushPromises();

    expect(UserServices.loginUser).toHaveBeenCalled();
    expect(JSON.parse(window.localStorage.getItem("user"))).toEqual({
      id: 50,
      token: "fake-token",
    });
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "recipes" });
    expect(wrapper.vm.snackbar.value).toBe(true);
    expect(wrapper.vm.snackbar.color).toBe("green");
  });
});
