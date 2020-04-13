## Text
When describing UI to click on, use backticks, for example: Choose `File` > `Export as Create ML`

Always use three backticks for code that needs to be run, for example:
```
cacli download <model-id>
```

For `guides`, avoid “we” for actions the user needs to do, for example avoid: “First we need to….” (This is fine for `workshops`)

For a variable the user needs to replace, use all lowercase with dashes: `<the-name-of-the-thing-to-replace>`

Use a spell check extension

Each markdown file generates an h1 header for the title and adds it to the sidebar. Only use (h2, h3, h4…) tags for headings in the actual markdown file. Any h2 tags will generate a sub heading link in the sidebar.

`workshops` are sorted by date

`guides` are sorted in `_config.yml`

## Screenshots
All assets should go under `/docs-assets/_images` the rest will be generated (by me)

```
{% include responsive.html image="<image-name>.png" %}
```

- Always fullscreen
- Use incognito Chrome 
- Use macOS to `Capture selected window` 
  - (Command + Shift + 4, spacebar, click) or (Command + Shift + 5, choose `Capture selected window`)
- To draw attention to something the user needs to click on:
  - rounded 8px red stoke, with 4px padding from a solid background button