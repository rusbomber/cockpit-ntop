# Cockpit-based nBox UI

![Alt text](doc/img/nprobe-ui.png?raw=true "nBox UI - nProbe Configuration")

## Prerequisites

- cockpit

```sh
apt install cockpit
```

- cockpit-navigator file manager (optional)

```sh
apt install cockpit-navigator
```

- npm (development only)

```sh
apt install npm
```
- ntop suite (from https://packages.ntop.org)

   - ntopng
   - nprobe
   - n2disk
   - cento
   - pf_ring


## Installation

Go to https://packages.ntop.org/ and configure the ntop packaging system for your platform according to the intstruction you will find on the site. Then follow the instructions below.


- Debian/Ubuntu:
   - `apt install nboxui`
   
- RedHat/Rocky Linux:
   - `yum install nboxui`
   - `systemctl enable --now cockpit.socket`

## Development

This section is relevant only if you plan to contribute to nBox UI development.

### Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev -- --host
```

### Compile and Minify

```sh
npm run build
```

### Compile and Install in Cockpit

```sh
sudo make build-install
```


### Install (pre-compiled dist) in Cockpit

```sh
sudo make install
```
