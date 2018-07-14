
/**
* Eliseo Geraldo · <e10169610@gmail.com>
* Storage Relational-Object Mapping
* 1.3.0 beta · 2018-06-30
* lic · MIT
*/

(function (global, factory) {

  // checking for exports avalible
  if (typeof module !== 'undefined' && module.exports) {
    // export Collection
    module.exports = factory()
  } else {
    // else add to global variable
    global['Collection'] = factory()
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

    /*
    * Config collection for sessionStorage or localStorage
    */
    this.storageType = (conf && conf.storeOnSession) ? 'sessionStorage' : 'localStorage'
    /*
    * callbackStacks
    */
    this.callbackStack = { save: [], find: [], erase: [], update: [] }

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
    // dispatch save events
    this.callbackStack.save.forEach (function (callback) { callback(ob) })

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
    this.callbackStack.erase.forEach(function (callback) { callback() })
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

      storeCollection = json(window[storageType].getItem(collection))
      if (storeCollection) polluteCollection(storeCollection)
      return storeCollection

    }
  }

  // Find method
  StormCollection.prototype.find = function (values, nod) {
    var result = __finder_prot(values, nod, this.collection, this.storageType)
    this.callbackStack.find.forEach(function (callback) { callback(result) })
    return result
  }

  // Find one method
  StormCollection.prototype.findOne = function (values, nod) {
    var result = (__finder_prot(values, nod, this.collection, this.storageType))[0]
    this.callbackStack.find.forEach(function (callback) { callback(result) })
    return result
  }

  // update method
  StormCollection.prototype.update = function (ob) {


    if (!ob.set || !ob.where) throw '[Store Error]: "set" or "where" node missing'

    if (
      typeof ob.where !== 'object' ||
      typeof ob.set !== 'object'
    ) throw '[Store Error]: "where" or "set" node expects objects'

    this.callbackStack.update.forEach (function (callback) { callback(ob) })

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

    var sortedResult = result.sort(function(a, b) {
      return (orderer === '<')
      ? a[parmOrder] < b[parmOrder]
      : a[parmOrder] > b[parmOrder]
    })

    this.callbackStack.find.forEach(function (callback) {
      callback(sortedResult)
    })

    return sortedResult
  }

  StormCollection.prototype.exists = function () {
    return !!window[this.storageType].getItem(this.collection)
  }

  StormCollection.prototype.on = function (type, callback) {
    if (typeof callback !== 'function') throw new Error ('onSave methods expects a function')
    if (['find', 'save', 'erase', 'update'].indexOf(type) < 0) throw new Error (type + ' is invalid event')

    this.callbackStack[type].push(callback)
  }

  return StormCollection
})
