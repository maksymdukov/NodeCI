const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page, browser);
    return new Proxy(page, {
      get(target, property) {
        return customPage[property] || target[property] || browser[property];
      },
    });
  }

  constructor(page, browser) {
    this.page = page;
    this.browser = browser;
  }

  async close() {
    return this.browser.close();
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);
    await this.page.goto("http://localhost:3000");
    await this.page.setCookie(
      { name: "session", value: session },
      { name: "session.sig", value: sig }
    );
    await this.page.goto("http://localhost:3000/blogs");
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, (el) => el.innerHTML);
  }

  async get(path) {
    return this.page.evaluate((path) => {
      return fetch(path, {
        method: "GET",
        credentials: "same-origin",
      }).then((response) => response.json());
    }, path);
  }

  async post(path, body) {
    return await this.page.evaluate(
      (path, body) => {
        return fetch(path, {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }).then((response) => response.json());
      },
      path,
      body
    );
  }

  async execRequests(actions) {
    const promises = actions.map(({ method, data, path }) =>
      this[method](path, data)
    );
    return Promise.all(promises);
  }
}

module.exports = CustomPage;
