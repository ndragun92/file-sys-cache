const path = require('path');

export default defineNuxtConfig({
  // https://github.com/nuxt-themes/docus
  extends: ['@nuxt-themes/docus'],
  devtools: { enabled: true },
  nitro: {
    output: {
      publicDir: path.join(__dirname, '../docs')
    }
  },
})
