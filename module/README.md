# @el173/use-reachability

[![npm version](https://img.shields.io/npm/v/@el173/use-reachability.svg)](https://www.npmjs.com/package/@el173/use-reachability)
<!-- [![build](https://github.com/your-username/use-reachability-template/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/use-reachability-template/actions) -->
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A universal React/React Native/Next.js hook for monitoring backend reachability via health check endpoints. Supports both `axios` and `fetch`, with optional retry, exponential backoff, and offline detection.

---

## 🚀 Features

- ✅ Works with **React**, **React Native**, and **Next.js (client components)**
- ✅ Supports `axios` or `fetch`
- ✅ Optional `onStatusChange()` callback
- ✅ Customizable health check interval and timeout
- ✅ Retry with exponential backoff
- ✅ Lightweight and dependency-free

---

## 📦 Installation

```bash
npm install @el173/use-reachability
# or
yarn add @el173/use-reachability
````

---

## 🧠 Usage

### Basic

```tsx
import useReachability from '@el173/use-reachability';

const App = () => {
  const isOnline = useReachability({
    healthCheckUrl: 'https://api.example.com/health',
  });

  return <Text>Status: {isOnline ? '🟢 Online' : '🔴 Offline'}</Text>;
};
```

---

### With `axios` and a status change callback

```tsx
import axios from 'axios';
import useReachability from '@el173/use-reachability';

const isBackendUp = useReachability({
  healthCheckUrl: 'https://api.example.com/actuator/health',
  axiosInstance: axios,
  onStatusChange: (status) => {
    console.log('Backend is now:', status ? 'UP' : 'DOWN');
  },
  healthCheckInterval: 30000, // 30 seconds
});
```

---

### Next.js Compatibility

`useReachability` is **client-safe** and works in client components:

```tsx
'use client';

import useReachability from '@el173/use-reachability';

export default function HealthStatus() {
  const isOnline = useReachability({
    healthCheckUrl: '/api/health',
  });

  return <p>Server status: {isOnline ? '✅' : '❌'}</p>;
}
```

---

## 🧾 API

| Option                | Type                        | Default     | Description                                         |
| --------------------- | --------------------------- | ----------- | --------------------------------------------------- |
| `healthCheckUrl`      | `string`                    | — *(req)*   | The backend health check endpoint (e.g., `/health`) |
| `axiosInstance`       | `AxiosInstance`             | `undefined` | Use axios instead of fetch                          |
| `onStatusChange`      | `(status: boolean) => void` | `undefined` | Callback when status changes                        |
| `healthCheckInterval` | `number` (ms)               | `30000`     | Polling interval in milliseconds                    |
| `healthCheckTimeout`  | `number` (ms)               | `15000`     | Timeout per request                                 |
| `maxRetries`          | `number`                    | `3`         | Number of retries if failed                         |
| `initialRetryDelay`   | `number` (ms)               | `1000`      | Delay for first retry                               |

---

## ✅ Examples

* [App Examples](./example/)

---

## 📄 License

MIT © [Hashith Karunarathne](https://github.com/el173)
