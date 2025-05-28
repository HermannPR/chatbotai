// Use CommonJS export for PostCSS config to support Node.js ESM environments
module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
};
