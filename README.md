# Rivet Website

The source for [rivet.dev](https://rivet.dev) — marketing pages, docs, and blog.

Each product's documentation is authored in that product's own repository and
vendored in here. See [`CLAUDE.md`](./CLAUDE.md) for the layout and
[`HIDDEN.md`](./HIDDEN.md) for what is deliberately unpublished.

## Develop

```bash
pnpm install
pnpm assemble   # link each product's docs bundle
pnpm dev
```

## License

[Apache 2.0](./LICENSE)
