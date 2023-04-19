/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './resources/views/*.{ejs,html}',
    './resources/views/**/*.{ejs,html}'
  ],
  theme: {
    extend: {
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
