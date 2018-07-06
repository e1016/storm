
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

  /*
  * Methods for convert JSON <-> String
  */
  var json = function (str) {
    return JSON.parse(str)
  }

  var string = function (obj) {
    return JSON.stringify(obj)
  }

  if (!support) throw '[Store Error]: local and session storage is not supported!'

  // initializing Store class model
  var StormCollection = function (str, conf) {

    this.storageType = (conf && conf.storeOnSession) ? 'sessionStorage' : 'localStorage'

    console.log(this.storageType);

    if (!str && typeof str !== 'string') throw new Error (
      '[Store Error]: Collection reference is not defined ' +
      'Collection constructor expects a String for use as ' +
      'a referenc in ' + conf.storeOnSession ? 'session' : 'local' + 'Storage'
    )
    // all is fine
    this.collection = str
  }

  // Save method
  StormCollection.prototype.save = function (ob) {
    var data

    // check for correct type of parameter
    // it should be an object
    if  (typeof ob !== 'object') throw '[Store Error]: "save" method expect a JSON'

    // check if register exists
    if ( data = json(window[this.storageType].getItem(this.collection)) ) {
      data.push(ob)
      window[this.storageType].setItem (
        this.collection,
        string(data)
      )
    } else {
      // insert data for first time
      data = []
      data.push(ob)
      window[this.storageType].setItem (
        this.collection,
        string(data)
      )
    }
  }

  // Delete method
  StormCollection.prototype.erase = function () {
    window[this.storageType].removeItem(this.collection)
  }

  var polluteCollection = function (obj) {
    obj.__proto__.last = function () { return this[obj.length - 1] }
    obj.__proto__.first = function () { return this[0] }
  }

  var __finder_prot = function (values, nod, collection, storageType) {
    var data
    var storeCollection = []
    var refactor = {}

    // if values is defined
    if (values) {

      if (typeof values !== 'object') throw '[Store Error]: "find" method expect a JSON'
      data = json(window[storageType].getItem(collection))

      // if the node is defined, it responds
      // only with the requested nodes
      if (nod && typeof nod === 'string') {
        for (var __j_key in values) {
          data.forEach(function(el) {
            if (el[__j_key] == values[__j_key]) {
              ( nod.split(/ +/g) ).forEach(function (nodMirror) {
                refactor[nodMirror] = el[nodMirror]
              })
              storeCollection.push(refactor)
              refactor = {}
            }
          })
        }
        // else, request all nodes
      } else {
        for (var __j_key in values) {
          data.forEach(function (el) {
            if (el[__j_key] == values[__j_key]) {
              storeCollection.push(el)
            }
          })
        }
      }

      if (storeCollection.length) polluteCollection(storeCollection)
      return storeCollection
    } else {

      console.log('storageType', storageType);

      storeCollection = json(window[storageType].getItem(collection))
      if (storeCollection.length) polluteCollection(storeCollection)
      return storeCollection

    }
  }

  // Find method
  StormCollection.prototype.find = function (values, nod) {
    return __finder_prot(values, nod, this.collection, this.storageType)
  }

  // Find one method
  StormCollection.prototype.findOne = function (values, nod) {
    return (__finder_prot(values, nod, this.collection, this.storageType))[0]
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

    if (data = json(window[this.storageType].getItem(this.collection))) {
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
      window[this.storageType].setItem (
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
    result = __finder_prot(undefined, undefined, this.collection, this.storageType)

    return (
      result.sort(function(a, b) {
        return (orderer === '<')
        ? a[parmOrder] < b[parmOrder]
        : a[parmOrder] > b[parmOrder]
      })
    )
  }

  StormCollection.prototype.exists = function () {
    return !!window[this.storageType].getItem(this.collection)
  }

  return StormCollection
})
