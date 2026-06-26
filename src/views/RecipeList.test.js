import { shallowMount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RecipeList from "./RecipeList.vue";
import RecipeServices from "../services/RecipeServices.js";

vi.mock("../services/RecipeServices.js", () => ({
  default: {
    getRecipes: vi.fn(),
    getRecipesByUserId: vi.fn(),
    addRecipe: vi.fn(),
  },
}));

describe("RecipeList.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("loads published recipes when no user is logged in", async () => {
    const recipes = [{ id: 1, name: "Published Recipe" }];
    RecipeServices.getRecipes.mockResolvedValue({ data: recipes });

    const wrapper = shallowMount(RecipeList);
    await flushPromises();

    expect(RecipeServices.getRecipes).toHaveBeenCalled();
    expect(wrapper.vm.recipes).toEqual(recipes);
  });

  it("loads user recipes when a user is stored in localStorage", async () => {
    const currentUser = { id: 123, name: "Test User" };
    window.localStorage.setItem("user", JSON.stringify(currentUser));

    const recipes = [{ id: 2, name: "Private Recipe" }];
    RecipeServices.getRecipesByUserId.mockResolvedValue({ data: recipes });

    const wrapper = shallowMount(RecipeList);
    await flushPromises();

    expect(RecipeServices.getRecipesByUserId).toHaveBeenCalledWith(123);
    expect(wrapper.vm.recipes).toEqual(recipes);
  });

  it("adds a new recipe and refreshes the recipe list", async () => {
    const currentUser = { id: 99 };
    window.localStorage.setItem("user", JSON.stringify(currentUser));

    RecipeServices.getRecipesByUserId
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [{ id: 3, name: "Saved Recipe" }] });
    RecipeServices.addRecipe.mockResolvedValue({ data: { success: true } });

    const wrapper = shallowMount(RecipeList);
    await flushPromises();

    wrapper.vm.newRecipe.name = "New Test Recipe";
    wrapper.vm.newRecipe.description = "A recipe to test addRecipe";
    wrapper.vm.newRecipe.servings = 4;
    wrapper.vm.newRecipe.time = "25";
    wrapper.vm.newRecipe.isPublished = true;

    await wrapper.vm.addRecipe();
    await flushPromises();

    expect(RecipeServices.addRecipe).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Test Recipe",
        userId: 99,
      })
    );
    expect(RecipeServices.getRecipesByUserId).toHaveBeenCalledTimes(2);
    expect(wrapper.vm.recipes).toEqual([{ id: 3, name: "Saved Recipe" }]);
  });
});
