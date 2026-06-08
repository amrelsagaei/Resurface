<div align="center">
  <img src="assets/banner.png" alt="Resurface" width="100%" />
</div>

Resurface is a Caido plugin for catching second-order and stored vulnerabilities
(stored XSS, second-order SQLi, cross-user leaks) that only show up later, far
from where you injected them. Generate a unique "canary" token, paste it
wherever you want to track, and Resurface watches all later traffic in your
project and alerts you the moment that token resurfaces.

## Installation

### From Plugin Store
1. Open Caido
2. Navigate to **Plugins** in the left sidebar
3. Search for "Resurface"
4. Click **Install**

### Manual Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Build the plugin:

   ```bash
   pnpm build
   ```

3. Install in Caido:
   - Upload the `dist/plugin_package.zip` file by clicking "Install Package" in Caido's plugin page

## Usage

Run **Generate canary** from the command palette (or the button in the Watched
tab) to create a token and copy it. Paste it anywhere you want to track, then
keep working. When it shows up in later traffic you get a toast, an optional
Caido finding, and an optional webhook alert.

---

<div align="center">
  <p>Made with care by <a href="https://amrelsagaei.com">Amr Elsagaei</a> for the Caido and security community</p>
</div>
