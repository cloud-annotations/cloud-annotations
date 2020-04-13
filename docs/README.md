## Guides
Each markdown file generates an `h1` header for the title and adds it to the sidebar. Only use (`h2`, `h3`, `h4`…) tags for headings in the actual markdown file. Any `h2` tags will generate a sub heading link in the sidebar.

Each markdown file should include a `title` at the top:
```
---
title: Non-interactive training
---
```

The order of the `guides` are specified in `_config.yml`

## Workshops
Each markdown file generates an `h1` header for the title and adds it to the sidebar. Only use (`h2`, `h3`, `h4`…) tags for headings in the actual markdown file.

Each markdown file should include a `title` and `order` at the top:
```
---
title: Preparing training data
order: 2
---
```

`workshops` are sorted by `order`

## Copy
When describing UI to click on, use single backticks, for example: Choose `File` > `Export as Create ML`

Use single backticks when referring to files, for example: Open `package.json`

Always use three backticks for code that needs to be run, for example:
```
cacli download <model-id>
```

For `guides`, avoid “we” for actions the user needs to do, for example avoid: “First we need to….” (This is fine for `workshops`)

For a variable the user needs to replace, use all lowercase with dashes: `<the-name-of-the-thing-to-replace>`

Use a spell check extension

For external links:
```
[Google](https://www.google.com/){:target="_blank"}
```

## Screenshots
All assets should go under `/docs-assets/_images` the rest will be generated (by me)

- Always fullscreen
- Use incognito Chrome 
- Use macOS to `Capture selected window` 
  - (<kbd>Command</kbd> + <kbd>Shift</kbd> + <kbd>4</kbd>, <kbd>spacebar</kbd>, click) or (<kbd>Command</kbd> + <kbd>Shift</kbd> + <kbd>5</kbd>, choose `Capture selected window`)
- To draw attention to something the user needs to click on:
  - rounded 8px red stoke, with 4px padding from a solid background button
  
To use an image:
```
{% include responsive.html image="<image-name>.png" %}
```
DON'T:
```
![](<image-name>.png)
```
