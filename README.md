![Sulphuris logo](https://avatars.githubusercontent.com/u/83950228)

# Sulphuris

[![npm version](https://img.shields.io/npm/v/sulphuris)](https://www.npmjs.com/package/sulphuris)

An adaptable CSS utility library

> Sulphuris aims to be the soul of your next front-end project. Inspired by [Bootstrap](https://github.com/twbs/bootstrap) and [Primer](https://github.com/primer/css), but tailored to suit your everyday front-end development needs.

Sulphuris is built around a single [`_config.scss`](https://github.com/sulphuris/sulphuris/blob/main/src/core/_config.scss) file that defines almost all utility class generation. By overriding these configuration variables, you can customize breakpoints, colors, spacing, and more — tailoring the framework to each project's specific needs.

### Highlights

- **Less !important usage** - abstaining from `!important` usage as much as possible.
- **Spacing size classes in pixels** - e.g. `.pt-32` results in `padding-top: 32px;`, and `.pt--32` results in `padding-top: -32px;`. **Note:** this might not be smart cause reusability of html like components, revise.
- **XXL screen breakpoint** - from 1680px. Or even larger. You can add any number of breakpoints.
- **REM units** - only for font sizes. **Note:** Do sizes really need rem units?

## 🚀 Getting Started

### Install

```bash
$ npm install sulphuris
```

### Usage

#### Version 2 (Current)

Uses SCSS modules (`@use`/`@forward`) for better scoping and tree-shaking. This makes it a bit difficult to override the config variables, but future proofs the usage.

To bundle Sulphuris utilities with your project you can use:

```scss
@use "sulphuris";
```

In order to configure Sulphuris you must override the default configuration, before the `@use 'sulphuris';` line.

The list of config variables you can override or negate (turn off) can be seen in the default config file: [core/\_config.scss](https://github.com/sulphuris/sulphuris/blob/main/src/core/_config.scss)

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

#### Version 1

Previously Sulphuris used the oldschool imports and overrides making it super easy to place your own overrides.

In your main SCSS file, import Sulphuris:

```scss
@import "_config.scss"; // Import your own configuration, it overrides the default one src/core/_config.scss so you can change only the variables you need
@import "sulphuris";
```

Be sure to include the `node_modules` directory in your `sass` include paths. This is usually done in your build tool configuration.

## 📚 Documentation

Full documentation lives in [`site/`](site/) as a Poops-built static site — an
introduction, a getting-started guide, the full configuration reference, and a
reference page per utility category (spacing, sizing, display, flexbox, grid,
position, colours, typography, borders, buttons, effects, and the SCSS
functions/mixins API).

Build and serve it locally:

```bash
$ script/docs        # build + serve with live reload
$ script/docs -b     # build once, no server
```

## 💻 Local Development

The build process is powered by [Poops](https://github.com/stamat/poops), a simple and fast build and bundle tool for modern web development.

### Running the local server

This project requires `node` and `npm` installed. To setup the project run `npm install`.

```bash
$ script/server
```

Will start a local development server. It will also watch for the changes and rebuild the project when necessary.

### Publishing

```bash
$ script/publish
```

Will run the [publish script](https://github.com/sulphuris/sulphuris/blob/main/script/publish) which will lead you through the npm publishing process. It can increment the version, build the code, tag it and publish it to npm.

If you want to create an GitHub release related to your version tag - make sure you have [GitHub CLI](https://cli.github.com) installed. This is purely optional.

## 📝 Contributing

If you have any ideas on how to improve Sulphuris, feel free to open an issue or a pull request. We're always looking for new contributors to help us make this project better.

### ToDo:

- [ ] Sort out the resets, they need to be reactive to margin and padding utilities (and other utilities)
- [ ] Aliases: Optional numerical utilities like bootstrap or primer (like pt-2 actually being padding-top: 8px)
- [ ] Inline links
- [ ] Animations and transitions
- [ ] Form elements
- [x] WRITE DOCS!!!!! — docs written in `site/`; wire up deployment to complete the site

## Name

Sulphuris is a Latin word for sulfur. Sulfur is a chemical element. Elemental sulfur at room temperature is a bright yellow, crystalline solid.

Sulphur is one of three components of lapis philosophorum, the philosopher's stone. Other two are mercury and salt. Sulphur is the soul of the stone, mercury is the spirit and salt is the body.

I was very interested in alchemy and the philosopher's stone when I was a kid. Fascinated by the idea of achieving immortality. And after I matured a bit I realized that the philosopher's stone is a metaphor for the state of enlightenment and inner balance. And that achieving immortality is not about living forever, but about living a meaningful life. Because infinite time means death of meaning.

I noticed that this aspect of the tria prima (three primes) is ambiguous and can be interpreted in many ways. Like the three primes of front-end development: HTML, CSS and JavaScript. So I decided to name this project Sulphuris. Where JavaScript is the spirit, HTML is the body and CSS is the soul - Front-end philosopher's stone.

But then if we look the tria prima from perspective of the web development front-end would represent the soul, back-end would represent the spirit and the database would represent the body. This means that one philosopher's stone can be made of many other philosopher's stones, and so on. Like a fractal. That's Alchemy.

_~Fullstack Alchemist_ :laughing:

## License

[MIT © Sulphuris](LICENSE)
