const Page = require("./helpers/page");

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("When logged in", async () => {
  beforeEach(async () => {
    page = await Page.build();
    await page.login();
    await page.click(".btn-floating.btn-large.red");
  });

  test("can see blog create form", async () => {
    const labelText = await page.getContentsOf("form div.title label");
    expect(labelText).toBe("Blog Title");
  });

  describe("and using valid inputs", () => {
    beforeEach(async () => {
      await page.type(".title input", `My title`);
      await page.type(".content input", `My content`);
      await page.click('form button[type="submit"]');
    });
    test("submitting takes user to review screen", async () => {
      const title = await page.getContentsOf("h5");
      expect(title).toBe("Please confirm your entries");
    });
    test("submitting and saving adds blog to index page", async () => {
      await page.click(".green.btn-flat.right.white-text");
      await page.waitFor(".card");
      const cardTitle = await page.getContentsOf(".card-title");
      const cardContent = await page.getContentsOf(".card-content p");
      expect(cardTitle).toBe("My title");
      expect(cardContent).toBe("My content");
    });
  });

  describe("And using invalid inputs", () => {
    test("the form shows an error message", async () => {
      await page.click('form button[type="submit"]');
      const titleError = await page.getContentsOf(".title .red-text");
      const contentError = await page.getContentsOf(".content .red-text");
      expect(titleError).toBe("You must provide a value");
      expect(contentError).toBe("You must provide a value");
    });
  });
});

describe("When not logged in", () => {
  const actions = [
    { method: "get", path: "/api/blogs" },
    {
      method: "post",
      path: "/api/blogs",
      data: {
        title: "My Title",
        content: "My content",
      },
    },
  ];

  test("login related actions are prohibited", async () => {
    const results = await page.execRequests(actions);
    results.forEach((result) =>
      expect(result).toEqual({
        error: "You must log in!",
      })
    );
  });

  // it("should throw an error trying to POST a new blog", async () => {
  //   const result = await page.post("/api/blogs", {
  //     title: "My Title",
  //     content: "My content",
  //   });
  //   expect(result).toEqual({ error: "You must log in!" });
  // });
  //
  // it("should throw an error trying to GET a posts", async () => {
  //   const result = await page.get("/api/blogs");
  //   expect(result).toEqual({ error: "You must log in!" });
  // });
});
