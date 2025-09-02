/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    corePlugins: {
        preflight: false,
    },
    theme: {
        extend: {
            colors: {
                matsysprimary: "#ffabf3"
            },
        },
    },
    plugins: [],
}
