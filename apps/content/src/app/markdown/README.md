# Markdown module

We store markdowns in the database so that they can be edited by our content editors from the CMS. Each markdown entry is identified by a unique `key`.

Apart from storing static markdown content, this module allows creating dynamic content by composing it with multiple markdown entries from the database. Consider the following example:

key: `base-template`
markdown:
```
# Some base content for the template.
Here is some base content.

# Some embedded content.
```jerry:intro-copy```
```

This markdown entry is _referencing_ another markdown entry with the key `intro-copy`. The markdown service can automatically pull the referenced entry from the database and replace the reference in the parent with its content. This is done recurisvely, but is restricted to 2 levels of depth. Note that the reference key must be prefixed with `jerry:` and enclosed in triple back ticks.

Furthermore, this reference resolution also supports variable substitution for dynamic references. Example:

markdown:
```
# This is some dynamic content
```jerry:intro-copy-${myVar}```
```

Note that the reference key `intro-copy-${myVar}` has a variable in it: `${myVar}`. We can pass a variable substituion map, e.g. `{ myVar: 'someValue' }` to the markdown service's reference resolution function and it will first resolve the reference name: `intro-copy-someValue`. Then it will proceed with resolving the actual reference. This allows flexibility to reuse markdown entries by injecting dynamic parts inside of it.
