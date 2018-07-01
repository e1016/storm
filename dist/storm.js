
/**
* Eliseo Geraldo · <e10169610@gmail.com>
* Storage Relational-Object Mapping
* 1.2.1 beta · 2018-06-30
* lic · MIT
*/

(function (global, factory) {

  // checking for exports avalible
  if (typeof module !== 'undefined' && module.exports) {
    // export Collection
    'app'
    module.exports = factory()
    'app'
  } else {
    // else add to global variable
    'app2'
    global['Collection'] = factory()
    'app2'
  }

}) (this, function () {

  // checking for native localStorage support
  var support = function support () {
    return localStorage !== undefined && localStorage !== null
  }

  if (!support) throw '[Store Error]: localStorage is not supported!'

  // initializing Store class model
  var StormCollection = function (str) {
    if (!str && typeof str !== 'string') throw new Error (
      '[Store Error]: Collection reference is not defined ' +
      'Collection constructor expects a String for use as ' +
      'a referenc in localStorage'
    )
    // all is fine
    this.collection = str
  }

  // Save method
  StormCollection.prototype.save = function (ob) {
    var data

    /*
    * Methods for convert JSON <-> String
    */
    var json = function (str) {
      return JSON.parse(str)
    }

    var string = function (obj) {
      return JSON.stringify(obj)
    }


    // check for correct type of parameter
    // it should be an object
    if  (typeof ob !== 'object') throw '[Store Error]: "save" method expect a JSON'

    // check if register exists
    if ( data = json(localStorage.getItem(this.collection)) ) {
      data.push(ob)
      localStorage.setItem (
        this.collection,
        string(data)
      )
    } else {
      // insert data for first time
      data = []
      data.push(ob)
      localStorage.setItem (
        this.collection,
        string(data)
      )
    }
  }

  // Delete method
  StormCollection.prototype.delete = function () {
    localStorage.removeItem(this.collection)
  }

  var __finder_prot = function (values, nod, collection) {
    var data
    var tmp = []
    var refactor = {}

    // if values is defined
    if (values) {

      if (typeof values !== 'object') throw '[Store Error]: "find" method expect a JSON'
      data = json(localStorage.getItem(collection))

      // if the node is defined, it responds
      // only with the requested nodes
      if (nod && typeof nod === 'string') {
        for (var __j_key in values) {
          data.forEach(function(el) {
            if (el[__j_key] == values[__j_key]) {
              ( nod.split(/ +/g) ).forEach(function (nodMirror) {
                refactor[nodMirror] = el[nodMirror]
              })
              tmp.push(refactor)
              refactor = {}
            }
          })
        }
        // else, request all nodes
      } else {
        for (var __j_key in values) {
          data.forEach(function (el) {
            if (el[__j_key] == values[__j_key]) {
              tmp.push(el)
            }
          })
        }
      }
      return tmp
    } else {
      return json(localStorage.getItem(collection))
    }
  }

  // Find method
  StormCollection.prototype.find = function (values, nod) {
    return __finder_prot(values, nod, this.collection)
  }

  // Find one method
  StormCollection.prototype.findOne = function (values, nod) {
    return (__finder_prot(values, nod, this.collection))[0]
  }

  // update method
  StormCollection.prototype.update = function (ob) {
    if (!ob.set || !ob.where) throw '[Store Error]: "set" or "where" node missing'

    if (
      typeof ob.where !== 'object' ||
      typeof ob.set !== 'object'
    ) throw '[Store Error]: "where" or "set" node expects objects'

    var data
    var rules = []
    var setterLength = 0
    var whereLength = 0
    var flag

    // checking for all avalible setters
    for (s in ob.set) setterLength++

    // check for all conditions
    for (w in ob.where) whereLength++

    if (data = json(localStorage.getItem(this.collection))) {
      data.forEach(function(data_el, indx) {
        flag = 0 // <- resetting flag to 0
        // checking for coincidences in each of stored object
        // conditios
        for (w in ob.where) flag += (ob.where[w] === data_el[w]) ? 1 : 0
        // nodes that will be returned
        if (flag === whereLength) {
          for (s in ob.set) data[indx][s] = ob.set[s]
        }
      })
      // saving updated object
      localStorage.setItem (
        this.collection,
        string(data)
      )
    } else {
      throw new Error('[Store Error]: has been ocurred an error trying to get data from ' + this.collection)
    }
  }

  // Find and Sort method
  StormCollection.prototype.findSorted = function (order) {
    var result, orderer, parmOrder
    if (typeof order !== 'string') throw '[Store Error]: Sort parameter should be String type'
    if (!(orderer = order.match(/[<|>]/)[0])) throw '[Store Error]: Error processing'

    parmOrder = order.replace(/[<|>]/, '').trim()
    result = __finder_prot(undefined, undefined, this.collection)

    return (
      result.sort(function(a, b) {
        return (orderer === '<')
        ? a[parmOrder] < b[parmOrder]
        : a[parmOrder] > b[parmOrder]
      })
    )
  }

  return StormCollection
})
