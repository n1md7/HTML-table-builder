### HTML table builder

## Installation
```shell script
npm install @n1md7/html-table-builder --save
```

### Demo
- [example-01](https://bichiko.github.io/HTML-table-builder/examples/example.html)

```javascript
let myTable = tableBuilder( tableAttribs || {} );
    myTable.setHeader( headers || {});
    myTable.setBody( dataArray || [] );
    myTable.appendTo( 'body div.container-fluid' );
```
