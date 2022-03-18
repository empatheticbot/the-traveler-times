# 📰 The Traveler Times

The Traveler Times is [a website](https://thetraveler.news) to keep up on [Destiny 2](https://www.bungie.net/7/en/Destiny/) news. It's still very much a work in progress, but has reached a point where I feel it's become useful–I hope you find it useful too!

## Project Structure

The project is a monorepo–made up of many sub-projects, all responsible for different aspects of the site:

- All the sub-projects with naming patterns of `d2-**-worker` are Cloudflare Workers used to provide some Destiny 2 data related to the name.
- `website` is just that. It's built using [Eleventy](https://www.11ty.dev). It calls into all the various workers for data to build the static site. It's hosted with Cloudflare Pages.
- `website-builder-worker` is also a Cloudflare Worker, but its only job is to kick off a Cloudflare Pages build and publish every hour to get the latest updates.
- `bungie-api-gateway` was originally meant to be the layer built on top of the [Bungie API](https://bungie-net.github.io/multi/index.html), but expanded to doing some additional things–like query Twitter. The world is an imperfect place 😅
- Finally, there are a couple utility and types projects that help share some code and typings between projects.

## Contribution

This section is in desperate need of attention! I know this! I'll hopefully get to this soon! 😬

## Getting Started

1. `npm install` and then `npm run bootstrap` will install all the dependencies for all the various packages.

2. Make sure [Cloudflare Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update) is installed. Then `npx wrangler login` to setup Cloudflare authorization to publish workers. (Note that this is going to be problematic for open source contributors–I have it on my list to [look into creating a Github Action to publish workers on PR merge](https://github.com/empatheticbot/the-traveler-times/issues/48). This doesn't solve testing–I'm still not sure what to do about that. 🤷‍♀️)

3. You can use `npm run start` in any project to start a development server. Currently, I'm not sure how to allow open source contributors to work on the workers without adding them to the team–so you may be out of luck, sorry! The `website` project does have mock data available, so you'll at least be able to start that (`npm run start:web`)!

## References

- [Cloudflare](https://www.cloudflare.com)
- [Eleventy](https://www.11ty.dev)
- [Nunjucks](https://mozilla.github.io/nunjucks/)
- [TypeScript](https://www.typescriptlang.org)
- [Rollup](https://www.rollupjs.org/guide/en/)
- [Bungie API](https://bungie-net.github.io/multi/index.html)
