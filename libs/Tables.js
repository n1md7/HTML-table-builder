/**
 * @param {Object|String} $attrs it can be either attribute labels or a query selector string
 *
 * @method {setHeader} sets Table header. Required method.
 *  @params {Object, Boolean} $names = null, $hidden = false
 *  It expects an Object list for each column
 *  ex: {{"Name text": {key: 'key1', width: 40}, ...}
 *  It will append all passed attributes as a key=value and main keyName will be displayed as a ColumnName
 *  If you want to hide header for some reason the second parameter should be True
 *  Setting the header params are important for later table functionality
 * @method {setBody} Sets Table body.
 *  @param {Object} $objList List of Objects
 * @method {appendTo} Appends an element to parent
 *  @param {string} querySelector
 * @method {done} After table creation has been done it triggers the callback function
 *  @param {function} $callback
 * @method {copy} Integer Copies column from parent table by index
 * @method {paste} Integer Pastes column on parent table by index
 * @method {remove} Removes either column or row
 * @method {insertInto} Inserts either cell or column or row
 * @method {on} Binds onCreate events by keys setting in setHeader {key: 'secondRow'}
 *  @param {function} callback which has one parameter which is current object of that element
 * @property object {get}
 *  @property object {asObject} returns the table object
 *  @property object {newColumn} returns the  last created column object
 *  @property object {newCell} returns the last created new cell object
 *  @property object {clipboard} returns a copied column
 *
 */
const TableBuilder = ( ( Table, window ) => {
  if ( window && 'document' in window ) {
    return $attrs => new Table( window.document, window, $attrs );
  }

} )( function ( d, w, $attrs = null ) {
  this.debug = false;
  let doneCallbacks = [];
  let createMode = false,
    newColumn = null,
    newCell = null;

  if ( typeof $attrs === "string" ) {
    this.table = d.querySelector( $attrs );
  } else if ( $attrs !== null ) {
    createMode = true;
    this.table = d.createElement( 'table' );
    this.headers = [];
    for ( let key in $attrs ) {
      if ( $attrs.hasOwnProperty( key ) ) {
        this.table.setAttribute( key, $attrs[ key ] );
      }
    }
  }

  this.debugMode = mode => this.debug = mode;

  /*helper functions*/
  let is = {
    pattern: {
      anArray: function ( anArray, size = 0 ) {
        let isArray = true;
        if ( undefined !== anArray && size !== 0 ) {
          if ( anArray instanceof Array && anArray.length === size ) {
            for ( let i = 0; i < anArray.length - 1; i++ ) {
              if ( !Array.isArray( anArray[ i ] ) && !( typeof anArray[ i ] === 'object' ) ) {
                isArray = false;
                break;
              }
            }
          }
        }

        return isArray;
      }
    }
  };

  this.orderKeys = [];
  let objectKeysBackup = [];
  let headerNames = {};
  /*
      Sets headers as an array
  */
  this.setHeader = function ( $names = null, $hidden = false ) {
    //$hidden is to hide header and just append body
    //header is important for order and validation
    if ( !createMode ) return;
    let hasAttrs = false;
    if ( null !== $names ) {
      switch ( true ) {
        case typeof $names === "string":
          // ex. "name,sname,table"
          this.headers = $names.split( ',' );
          break;
        case $names instanceof Array:
          // ex. ["name", "sname", "table"]
          this.headers = $names;
          break;
        case typeof $names === 'object':
          // ex. {name: {id:1, colspan:2}, sname: {colspan:3}}
          this.headers = Object.keys( $names );
          headerNames = $names;
          hasAttrs = true;
          break;
      }

      let header = this.table.createTHead(), row, cell;
      if ( !$hidden ) {
        // -1 to append in the end
        row = header.insertRow( -1 );
      }

      if ( hasAttrs ) {
        Object.entries( $names )
          .forEach( function ( name ) {
            if ( !$hidden ) {
              cell = row.insertCell( -1 );
              cell.innerHTML = name[ 0 ];
              cell.setAttribute( "title", name[ 0 ] );
            }

            let attrs = name[ 1 ];
            if ( typeof attrs !== 'string' ) {
              for ( let attr in attrs ) {
                if ( attrs.hasOwnProperty( attr ) ) {
                  //extract keys here
                  //it will be used for ordering the body table
                  if ( attr === 'key' ) {
                    self.orderKeys.push( attrs[ attr ] );
                  }
                  if ( !$hidden ) {
                    cell.setAttribute( attr, attrs[ attr ] );
                    if ( attr === 'key' ) {
                      cell.setAttribute( 'data-key', attrs[ attr ] );
                    }
                  }
                }
              }
            }
          } );
      } else {
        this.headers
          .forEach( function ( name ) {
            if ( !$hidden ) {
              cell = row.insertCell( -1 );
              cell.innerHTML = name;
              cell.setAttribute( "title", name );
            }
          } );
      }
    }

    return this;
  };

  this.setBody = function ( $objList = null, keys = [] ) {
    if ( !createMode ) return;
    if ( $objList !== null ) {
      $objList = Object.entries( $objList );
      let body = this.table.appendChild( d.createElement( 'tbody' ) ), row, cell;
      for ( let $row = 0; $row < Object.keys( $objList ).length; $row++ ) {
        row = body.insertRow( -1 );
        //set default parameters
        row.setAttribute( 'data-key', $objList[ $row ][ 0 ] );

        let dataValue = key => $objList[ $row ][ 1 ][ key ] || `data-${ key }='not found'`;
        keys.forEach( key => row.setAttribute( `data-${ key }`, dataValue( key ) ) );

        for ( let _col = 0; _col < this.orderKeys.length; _col++ ) {
          var innerHTML = null, dataKey = '', currRowData = '';
          if ( Object.keys( $objList[ $row ][ 1 ] ).indexOf( this.orderKeys[ _col ] ) !== -1 ) {
            innerHTML = $objList[ $row ][ 1 ][ this.orderKeys[ _col ] ];
            currRowData = $objList[ $row ][ 1 ];
          }
          dataKey = this.orderKeys[ _col ];
          cell = row.insertCell( -1 );
          cell.setAttribute( 'data-key', dataKey );
          cell.setAttribute(
            'data-content',
            null === innerHTML || innerHTML.length === 0 ? '!' : innerHTML
          );
          cell.innerHTML = innerHTML;

          let tmpObj = {};
          tmpObj[ dataKey ] = cell;
          tmpObj.data = currRowData;
          //save objects by key
          objectKeysBackup.push( tmpObj );
        }
      }
    }

    return this;
  };


  this.on = function ( event, fnc ) {
    if ( this.orderKeys.indexOf( event ) === -1 ) {
      this.debug && console.warn( 'No such key "' + event + '" to trigger custom event' );

      return this;
    }

    objectKeysBackup.forEach( function ( cell ) {
      let $key = Object.keys( cell )[ 0 ];
      if ( $key === event ) {
        fnc.call( this, cell[ $key ], cell.data );
      }
    }, this );

    return this;
  };

  //insert column in specific index of the table
  //@where could be either body or head
  this.insertInto = function ( where = 'body' ) {
    return {
      setCell: ( $column = null, $coordinates = null, $return ) => {
        //default is false
        $return = undefined !== $return;
        if ( $column instanceof Array ) {
          if ( "string" === typeof $column[ 0 ] && !Array.isArray( $column[ 0 ] ) ) {

            if ( !is.pattern.anArray( $coordinates, 2 ) ) {
              //$coordinates = [x, y] pair
              var target = null;
              switch ( true ) {
                case where === 'body':
                  target = self.table.tBodies[ 0 ];
                  break;
                case where === 'head':
                  target = self.table.tHead;
                  break;
                default:
                  console.warn( 'Only "body" and "head" are allowed!' );
                  return self;
              }
              var rows = target.rows, cell = {};
              if ( undefined !== rows[ $coordinates[ 0 ] ] ) {
                cell = rows[ $coordinates[ 0 ] ].insertCell( $coordinates[ 1 ] );
                cell.setAttribute( 'data-key', $column[ 0 ] );
                if ( typeof $column[ 1 ] !== "string" ) {
                  cell.appendChild( $column[ 1 ] );
                } else
                  cell.innerHTML = $column[ 1 ];
                newCell = cell;
              }

              if ( $return ) {
                return cell;
              }
            } else {
              this.debug && console.warn( 'Expected exactly two elements of an Array! $coordinates = [x, y] pair' );
            }
          } else if ( $column.length === $coordinates.length ) {
            for ( var col = 0; col < $column.length; col++ ) {
              self.insertInto( "body" ).setCell( $column[ col ], $coordinates[ col ] );
            }
          }
        } else {
          this.debug && console.warn( 'Expected an Array for @setColumn parameter! ex. ["key", "value"] or [["key", "value"],["key", "value"],["key", "value"]]' );
        }

        return self;
      },
      setEmptyColumn: ( $index = 2 ) => {
        let column = [
          self.insertInto( 'head' )
            .setCell( [ '__loading__', '&nbsp;'.repeat( 20 ) ],
              [ 0, $index ],
              true
            )
        ];
        // minus 1 to exclude head tr
        Array( self.table.rows.length - 1 ).fill( 0 )
          .forEach( function ( e, i ) {
            column.push(
              self.insertInto( 'body' )
                .setCell(
                  [ '__loading__', '&nbsp;'.repeat( 20 ) ],
                  [ i, $index ],
                  true
                )
            );
          } );

        newColumn = column;

        return self;
      },
      setRow: function ( $index = 1, callback = null) {

          var target = null;
          switch ( true ) {
            case where === 'body':
              target = self.table.tBodies[ 0 ];
              break;
            case where === 'head':
              target = self.table.tHead;
              break;
            default:
              console.warn( 'Only "body" and "head" are allowed!' );
              return self;
          }

          var row = target.insertRow( $index ), cells = [];
          for ( var _col = 0; _col < self.orderKeys.length; _col++ ) {
            var dataKey = '';

            dataKey = self.orderKeys[ _col ];

            var cell = row.insertCell( -1 );
            cell.setAttribute( 'data-key', dataKey );

            //save objects by key
            // cells.push({[self.orderKeys[_col]]:cell});
            cells.push( cell );
          }

          if ( null !== callback ) {
            if ( "function" === typeof callback ) {
              cells.forEach( function ( cell ) {
                callback.call( self, cell );
              } );
            }
          }

        return self;
      }
    };
  };

  this.remove = function ( what ) {
    what = undefined === what ? 'column' : what;

    return {
      column: function ( $index ) {
        $index = undefined === $index ? null : $index;

        if ( null !== $index ) {
          if ( typeof $index === "number" ) {
            Array( self.table.rows.length )
              .fill( 1 ).forEach(
              function ( e, i ) {
                self.remove( 'cell' ).where( [ i, $index ] );
              }
            );
          } else {
            console.warn( "Expected number type!" );
          }
        }

        return self;
      },
      where: function ( $key ) {
        $key = undefined === $key ? null : $key;

        if ( $key instanceof Array ) {
          var target = self.table;
          switch ( true ) {
            case what === 'row':
            case what === 'cell':
              break;
            default:
              console.warn( 'Only "row" and "cell" are allowed!' );
              return self;
          }
          var rows = target.rows;
          var tr = rows[ $key[ 0 ] ];
          if ( $key[ 0 ] instanceof Array ) {
            $key.forEach( function ( key ) {
              self.remove( what ).where( [ key ] );
            } );
          } else if ( typeof $key[ 0 ] === "number" ) {
            if ( what === 'cell' ) {
              if ( tr.cells[ $key[ 1 ] ] !== undefined ) {
                tr.deleteCell( $key[ 1 ] );
              } else {
                self.debug && console.warn( 'Tried to remove an index that was out of scope. A cell [y,x] => [' + $key[ 0 ] + ',' + $key[ 1 ] + '] doesn\'t exist! Note: you need to pass [y,x] pairs' );
              }
            } else {
              if ( typeof tr !== "undefined" ) {
                target.deleteRow( $key[ 0 ] );
              } else {
                self.debug && console.warn( 'Tried to remove an index that was out of scope. A row number ' + $key[ 0 ] + ' doesn\'t exist! Note you need to pass single element array [y]' );
              }
            }
          }
        }

        return self;
      }
    };
  };

  var appendDone = false;
  this.done = function ( fns ) {
    if ( typeof fns === "function" ) {
      if ( appendDone ) {
        fns.call( this.get.asObject );
      } else {
        doneCallbacks.push( fns );
      }
    }

    return this;
  };

  var self = this;
  this.appendTo = function ( $selector ) {
    if ( !createMode ) return;
    // cssSelector #id.class>div
    if ( typeof $selector === "string" ) {
      d.querySelector( $selector ).appendChild( this.table );
    } else {
      $selector.appendChild( this.table );
    }
    appendDone = true;
    doneCallbacks.forEach( function ( fn ) {
      fn.call( this.get.asObject );
    }, this );
    return this;
  };

  var cloned = {};
  this.copy = function ( $cellIndex ) {
    $cellIndex = undefined === $cellIndex ? 1 : $cellIndex;

    var hRows = this.table.tHead.rows;
    var bRows = this.table.tBodies[ 0 ].rows;
    //reset var
    cloned = { head: [], body: [] };
    for ( var hRow in hRows ) {
      if ( hRows.hasOwnProperty( hRow ) ) {
        cloned.head.push( hRows[ hRow ].cells[ $cellIndex ].cloneNode( true ) );
      }
    }
    for ( var bRow in bRows ) {
      if ( bRows.hasOwnProperty( bRow ) ) {
        cloned.body.push( bRows[ bRow ].cells[ $cellIndex ].cloneNode( true ) );
      }
    }

    return this;
  };

  this.paste = function ( $cellIndex ) {
    $cellIndex = undefined === $cellIndex ? 1 : $cellIndex;

    if ( typeof cloned.head === "undefined" ) {
      self.debug && console.warn( 'You should copy first! Clipboard is empty.' );
      return this;
    }
    var table = this.table;
    var hRows = table.tHead.rows;
    var bRows = table.tBodies[ 0 ].rows;

    for ( var hRow in hRows ) {
      if ( hRows.hasOwnProperty( hRow ) ) {
        hRows[ hRow ].insertBefore( cloned.head[ hRow ], hRows[ hRow ].cells[ $cellIndex ] );
      }
    }
    for ( var bRow in bRows ) {
      if ( bRows.hasOwnProperty( bRow ) ) {
        bRows[ bRow ].insertBefore( cloned.body[ bRow ], bRows[ bRow ].cells[ $cellIndex ] );
      }
    }

    return this;
  };


  this.get = {
    get asObject() {

      return self.table;
    },
    get newColumn() {

      return newColumn;
    },
    get newCell() {

      return newCell;
    },
    get clipboard() {

      return cloned;
    }
  };


}, window );
