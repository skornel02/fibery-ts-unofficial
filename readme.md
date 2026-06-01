# WIP Unofficial Fibery API Client in TypeScript

![npm version](https://img.shields.io/npm/v/@skornel02/fibery-ts-unofficial.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)


> [!WARNING]
> This project is currently a work in progress. The API surface is not finalized, and breaking changes may occur without warning. Use at your own risk and feel free to contribute!

This project is a fork of the original [fibery-unofficial](https://gitlab.com/fibery-community/unofficial-js-client), aimining to provide a modern, TypeScript-first API client for Fibery.

This project is a modernized fork and evolution of the original , redesigned for maximum compatibility across Node.js, browsers, and edge runtimes.

## ✨ Key Features & Improvements

* **Injectable `fetch`**: This client allows you to inject your own `fetch` implementation. This makes the library lightweight and customizable for various environments.
* **TypeScript Support**: Future version will be totally rewritten in TypeScript, providing strong typing and better developer experience.

## 📦 Installation

```bash
npm install @skornel02/fibery-ts-unofficial
# or
yarn add @skornel02/fibery-ts-unofficial
# or
pnpm add @skornel02/fibery-ts-unofficial

```

## 🚀 Quick Start

To use the client, instantiate it with your Fibery workspace URL, your API token, and optionally your environment's `fetch` implementation.

### In Node.js (18+) or Browser

If you are using Node 18+ or running this in the browser, `fetch` is available natively:

```typescript
import { FiberyClient } from 'your-package-name';

const fibery = new FiberyClient({
  host: 'YOUR_ACCOUNT.fibery.io',
  token: 'YOUR_API_TOKEN',
  fetch: globalThis.fetch // Inject native fetch
});

```

### In Older Node Environments (Pre-18)

If you are using an older version of Node, you can inject a library like `node-fetch` or `cross-fetch`:

```typescript
import { FiberyClient } from 'your-package-name';
import fetch from 'node-fetch';

const fibery = new FiberyClient({
  host: 'YOUR_ACCOUNT.fibery.io',
  token: 'YOUR_API_TOKEN',
  fetch: fetch // Inject third-party fetch
});

```

### Library usage

This client supports the same API methods as the original -- there are two main ways to interact with the API: method-way and command-way.

Method-way is used in the [API documentation](https://fibery.gitlab.io/api-docs/?javascript):

```javascript
const users = await fibery.entity.query({
  'q/from': 'fibery/user',
  'q/select': ['fibery/id', 'user/name'],
  'q/limit': 3
});
```

It is equivalent to command-way:

```javascript
const usersCommand = fibery.command.queryEntityCmd({
  'q/from': 'fibery/user',
  'q/select': ['fibery/id', 'user/name'],
  'q/limit': 3
});

const users = await fibery.command.execute(usersCommand);
```


## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📜 Acknowledgements

A massive thank you to the [Fibery Community](https://gitlab.com/fibery-community) and the authors of the original `unofficial-js-client` for laying the groundwork for this library.

## 📄 License

This project is [MIT](https://www.google.com/search?q=LICENSE) licensed.

```
