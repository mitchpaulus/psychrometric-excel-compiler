# Psychrometric Excel Compiler

This is the source code for the webpage [excel-psychrometrics.com](https://excel-psychrometrics.com).

This page gets you the correct spreadsheet formulas for psychrometric calculations.

Technologies used to build this page:

 - TypeScript
 - [knockout.js](https://knockoutjs.com)

## Building

Only dependency is TypeScript.
Can build single target page `index.html` by using command `make`.

To help build the HTML UI, there is an awk script that can be used like:

```sh
awk -f build-row.awk t-rh-properties.txt
```

For the wet bulb case, however, there is an extra condition added to the
dew point temperature calculation that requires that the partial
pressure already be specified.
