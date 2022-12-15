# Cockpit-based nBox UI

## Prerequisites

- cockpit
- ntopng

```sh
apt install cockpit
```

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev -- --host
```

### Compile and Minify for Production

```sh
npm run build
```

### Install nBox UI Plugins in Cockpit

```sh
sudo make install
```
