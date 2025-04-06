# @zayne-labs/toolkit

A powerful collection of utility functions, types, and composables designed to accelerate development across various JavaScript/TypeScript projects. Built with modularity and type-safety in mind.

## 📦 Packages

- `@zayne-labs/toolkit-core` - Core utility functions and helpers
- `@zayne-labs/toolkit-type-helpers` - Advanced TypeScript type utilities and helpers
- `@zayne-labs/toolkit-react` - React-specific hooks, utilities, and Zustand integrations

## ✨ Features

- 🎯 Modular design - Import only what you need
- 📝 Full TypeScript support with advanced type utilities
- ⚛️ React hooks and utilities for common patterns
- 🔄 Zustand store integrations and helpers
- 🎨 Zero runtime overhead for type utilities
- 📦 Tree-shakeable exports
- 🧪 Thoroughly tested utilities
- 🔜 Support for Vue, Svelte, and Solid coming soon!

## 📥 Installation

```bash
# Using pnpm (recommended)
pnpm add @zayne-labs/toolkit

# Using npm
npm install @zayne-labs/toolkit

# Using yarn
yarn add @zayne-labs/toolkit
```

## 🚀 Quick Start

```typescript
// Core utilities
import { someUtil } from '@zayne-labs/toolkit/core'

// React hooks
import { useToggle } from '@zayne-labs/toolkit/react'

// React utilities
import { cn } from '@zayne-labs/toolkit/react/utils'

// Zustand utilities
import { createStore } from '@zayne-labs/toolkit/react/zustand'

// Type helpers
import type { Prettify } from '@zayne-labs/toolkit/type-helpers'
```

## 🛠️ Development

This project uses pnpm as the package manager. To get started with development:

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run development build
pnpm build:dev

# Run tests
pnpm build:test

# Lint code
pnpm lint:eslint

# Format code
pnpm lint:format
```

## 📁 Project Structure

```
toolkit/
├── packages/
│   ├── toolkit/          # Main package that exports all utilities
│   ├── toolkit-core/     # Core JavaScript/TypeScript utilities
│   ├── toolkit-react/    # React-specific hooks and utilities
│   └── toolkit-type-helpers/  # TypeScript type utilities
├── dev/                  # Development utilities
└── package.json         # Root package.json
```

## 🤝 Contributing

We welcome contributions! Please check out our [contribution guidelines](https://github.com/zayne-labs/contribute) for details on how to get started.

## 📄 License

MIT © [Ryan Zayne]

---
