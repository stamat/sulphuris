![Sulphuris logo](https://avatars.githubusercontent.com/u/83950228)

# Sulphuris

[![npm version](https://img.shields.io/npm/v/sulphuris)](https://www.npmjs.com/package/sulphuris)
[![build status](https://github.com/stamat/sulphuris/actions/workflows/ci.yml/badge.svg)](https://github.com/stamat/sulphuris/actions/workflows/ci.yml)
[![license](https://img.shields.io/github/license/stamat/sulphuris.svg)](https://github.com/stamat/sulphuris/blob/main/LICENSE)

An adaptable CSS utility library

> [!NOTE]
> Sulphuris sits somewhere between the old-school utility libraries [Bootstrap](https://github.com/twbs/bootstrap) and [Primer](https://github.com/primer/css) on one side and on the other [Tailwind](https://github.com/tailwindlabs/tailwindcss).

Sulphuris is built around a single [`_config.scss`](https://github.com/stamat/sulphuris/blob/main/src/core/_config.scss) file that defines almost all utility class generation. It is basically design tokens but in scss. By overriding these configuration variables, you can customize breakpoints, colors, spacing, and more — tailoring the framework to each project's specific needs.

**[📖 Docs](https://stamat.github.io/sulphuris/docs)**

### Highlights

- **Design tokens** - A single SCSS [`_config.scss`](https://github.com/stamat/sulphuris/blob/main/src/core/_config.scss) containing the variables that dictate which utilities will be generated. You can wire your Figma design tokens to directly override the config variables (with a bit of work, or simply use [poops](https://stamat.info/poops/docs/quick-start/transpiling-css.html#design-tokens).
- **Less !important usage** - abstaining from `!important` usage as much as possible.
- **Spacing size classes named in pixels** - e.g. `.pt-32` results in `padding-top: 2rem;` (32px at the default root), and `.pt--32` in `padding-top: -2rem;`. The number in the class name is a design token, not the unit.
- **XXL screen breakpoint** - from 1680px. Or even larger. You can add any number of breakpoints.
- **REM units** - sizes, font sizes, breakpoint widths and the container/grid metrics all emit `rem`, so a layout scales with the reader's browser font-size setting instead of ignoring it (px only responds to zoom). All of it is still *written* in px and converted at emit time, so config overrides stay px. Border widths and radii stay px, where fractional values render fuzzy. `$rem-units: false` reverts the lot without moving a class name.

## 🚀 Getting Started

### Install

```bash
$ npm install sulphuris
```

### Usage

Uses SCSS modules (`@use`/`@forward`) for better scoping and tree-shaking. This makes it a bit difficult to override the config variables, but future proofs the usage (meaning `dart-sass v3`).

To bundle Sulphuris utilities with your project you can use:

```scss
@use "sulphuris";
```

In order to configure Sulphuris you must override the default configuration, before the `@use 'sulphuris';` line.

The list of config variables you can override or negate (turn off) can be seen in the default config file: [core/\_config.scss](https://github.com/stamat/sulphuris/blob/main/src/core/_config.scss)

```scss
@forward "sulphuris/core/config" with (
  $colors: (
    black: #000000,
    white: #ffffff,
    primary: #824f2d,
    brownish: #dcc8ac,
    muted: #6d6d6d,
  ),
  $breakpoints: (
    ...,
  )
);

@use "sulphuris";
```

Overriding the default configuration with create the style utility classes tailored for your project.

#### Legacy imports

Previously Sulphuris used the oldschool imports and overrides making it super easy to place your own overrides.

In your main SCSS file, import Sulphuris:

```scss
@import "_config.scss"; // Import your own configuration, it overrides the default one src/core/_config.scss so you can change only the variables you need
@import "sulphuris";
```

Be sure to include the `node_modules` directory in your `sass` include paths. This is usually done in your build tool configuration.

## 💻 Local Development

The build process is powered by [Poops](https://github.com/stamat/poops), a simple and fast build and bundle tool for modern web development.

### Running the local server

This project requires `node` and `npm` installed. To setup the project run `npm install`.

```bash
$ script/server
```

Will start a local development server. It will also watch for the changes and rebuild the project when necessary. `script/server` only serves the repo root, where `/docs/` does not exist yet.

### Generating docs

To develop or build the docs use either following:

```bash
$ script/docs        # build + serve on :4041 with live reload
$ script/docs -b     # build once, no server
```

The **Class Reference** page is generated, not written — `script/gen-reference.mjs` parses the built `dist/sulphuris.css` and emits every selector with its declarations, so it cannot drift from what Sass actually produces.

### Publishing

```bash
$ script/publish
```

Will run the [publish script](https://github.com/stamat/sulphuris/blob/main/script/publish) which will lead you through the npm publishing process. It can increment the version, build the code, tag it and create a new GitHub release (make sure that you have `gh` [GitHub CLI](https://cli.github.com) installed and authentified).

Publishing GitHub action is set to publish to NPM when a new release is created.

## 📝 Contributing

If you have any ideas on how to improve Sulphuris, feel free to open an issue or a pull request. Contributions welcome!

### ToDo:

- [ ] Sort out the resets, they need to be reactive to margin and padding utilities (and other utilities)
- [ ] Aliases: Optional numerical utilities like bootstrap or primer (like pt-2 actually being padding-top: 8px)
- [ ] Inline links
- [ ] Animations and transitions
- [ ] Form elements

## Why

It's 2021. After years of making websites I realized I'm copy/pasting a set of utilities that were growing as the time progressed. Primer and Bootstrap were a bit too stubborn for my taste just because I wanted something like that but configurable to the extreme. Something that will adapt to every project that I embark on. So I made my own.

P.S. I found out about Tailwind a while later. I'm not a guy who follows the news. And even then I preferred the old school, cause sometimes it gets hard to swim in Tailwind class soup.

## Name

Sulphuris is a Latin word for sulfur. Sulfur is a chemical element. Elemental sulfur at room temperature is a bright yellow, crystalline solid.

Sulphur is one of three components of lapis philosophorum, the philosopher's stone. Other two are mercury and salt. Sulphur is the soul of the stone, mercury is the spirit and salt is the body.

I was very interested in alchemy and the philosopher's stone when I was a kid. Fascinated by the idea of achieving immortality. And after I matured a bit I realized that the philosopher's stone is a metaphor for the state of enlightenment and inner balance. And that achieving immortality is not about living forever, but about living a meaningful life. Because infinite time means death of meaning.

I noticed that this aspect of the tria prima (three primes) is ambiguous and can be interpreted in many ways. Like the three primes of front-end development: HTML, CSS and JavaScript. So I decided to name this project Sulphuris. Where JavaScript is the spirit, HTML is the body and CSS is the soul - Front-end philosopher's stone.

But then if we look the tria prima from perspective of the web development front-end would represent the soul, back-end would represent the spirit and the database would represent the body. This means that one philosopher's stone can be made of many other philosopher's stones, and so on. Like a fractal. That's Alchemy.

_~Fullstack Alchemist_ :laughing:

## License

[MIT](LICENSE) 2021 [@stamat](https://github.com/stamat)
