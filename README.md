### HTML table builder

![builder](https://img.shields.io/badge/HTML--table-bulder-brightgreen)
![npm-version](https://img.shields.io/npm/v/@n1md7/html-table-builder
)

## Installation
```shell script
npm install @n1md7/html-table-builder --save
```
or

```shell script
yarn add @n1md7/html-table-builder
```

or unpkg link 
```html
<script src="https://unpkg.com/@n1md7/html-table-builder@1.0.1/libs/index.js"></script>
```

### Demo
- [example-01](https://bichiko.github.io/HTML-table-builder/examples/example.html)

```javascript
let myTable = tableBuilder( tableAttribs || {} );
    myTable.setHeader( headers || {});
    myTable.setBody( dataArray || [] );
    myTable.appendTo( 'body div.container-fluid' );
```
