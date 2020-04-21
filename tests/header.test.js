const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

test("the header has the correct text", async () => {
  const headerText = await page.getContentsOf("a.brand-logo");
  expect(headerText).toBe("Blogster");
});

test("clicking login starts oauth flow", async () => {
  await page.click(".right a");
  const url = page.url();
  expect(url).toMatch(/https:\/\/accounts\.google\.com/);
});

test("When signed in, shows logout button", async () => {
  await page.login();
  await page.waitFor('a[href="/auth/logout"]');
  const btnContent = await page.$eval(
    'a[href="/auth/logout"]',
    (el) => el.innerHTML
  );
  expect(btnContent).toEqual("Logout");
});
