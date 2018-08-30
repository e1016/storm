
/**
* Eliseo Geraldo · <e10169610@gmail.com>
* Storm Storage
* 1.3.4 beta · 2018-07-30
* lic · MIT
*/

(function (factory) {

  // checking for exports avalible
  if (typeof module !== 'undefined' && module.exports) {
    // export Collection
    module.exports.Collection = factory()
  } else {
    // else add to root variable
    window['Collection'] = factory()
  }

}) (function () {

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
    * callback stacks
    */
    this.callbackStack = { save: [], find: [], erase: [], update: [] }

    if (!str && typeof str !== 'string') throw new Error (
      '[Store Error]: Collection reference is not defined ' +
      'Collection constructor expects a String for use as ' +
      'a referenc in ' + conf.storeOnSession ? 'session' : 'local' + 'Storage'
    )
    // all is fine
    this.storeReference = str
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
    if ( data = json(window[this.storageType].getItem(this.storeReference)) ) {
      data.push(ob)
      window[this.storageType].setItem (
        this.storeReference,
        string(data)
      )
    } else {
      // insert data for first time
      data = []
      data.push(ob)
      window[this.storageType].setItem (
        this.storeReference,
        string(data)
      )
    }
  }

  // Delete method
  StormCollection.prototype.erase = function (conditions) {

    if (conditions) {
      var store = json(window[this.storageType].getItem(this.storeReference))
      var matchCounter
      var keeped = [], erased = []
      var conditionsLength = Object.keys(conditions).length

      store.forEach(function (el) {
        matchCounter = 0
        for (var conKey in conditions)
          if (conditions[conKey] === el[conKey]) matchCounter++

        if (conditionsLength === matchCounter)
          erased.push(el)
        else
          keeped.push(el)
      })
      window[this.storageType].setItem(this.storeReference, string(keeped))
      return {
        keeped: keeped,
        erased: erased
      }
    } else {
      window[this.storageType].removeItem(this.storeReference)
    }


    this.callbackStack.erase.forEach(function (callback) { callback() })
  }

  var polluteCollection = function (obj) {
    obj.__proto__.last = function () { return this[obj.length - 1] }
    obj.__proto__.first = function () { return this[0] }
  }

  /**
  * function baseFinderMethod returns
  * entire collection, based on some parameters
  *
  * @param values is used for define filter
  * collection, for example, find user where age
  * is 23, or name is "Juan"
  *
  * @param nod who fields we get, for example,
  * get name, age and _id
  *
  * @param collection contains a reference
  * for manipulate data in storage
  * localStorage.getItem(collection)
  *
  * @param storageType works for switch between
  * localStorage and sessionStorage
  */

  var baseFinderMethod = function (values, nod, collection, storageType) {
    var data
    var storeCollection = []
    var refactoredObject = {}

    if (values) {

      if (typeof values !== 'object') throw '[Store Error]: "find" method expect a JSON'
      data = json(window[storageType].getItem(collection))

      // if the node is defined, it responds
      // only with the requested nodes
      if (nod && typeof nod === 'string') {
        for (var JsonKey in values) {
          data.forEach(function (el) {
            if (el[JsonKey] == values[JsonKey]) {
              nod.split(/ +/g).forEach(function (nodMirror) {
                refactoredObject[nodMirror] = el[nodMirror]
              })
              storeCollection.push(refactoredObject)
              refactoredObject = {}
            }
          })
        }
        // else, request all nodes
      } else {
         for (var JsonKey in values) {
            data.forEach(function (el) {
            if (el[JsonKey] == values[JsonKey] && (storeCollection.indexOf(el) < 0)) {
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
    var result = baseFinderMethod(values, nod, this.storeReference, this.storageType)
    this.callbackStack.find.forEach(function (callback) { callback(result) })
    return result
  }

  // Find one method
  StormCollection.prototype.findOne = function (values, nod) {
    var result = (baseFinderMethod(values, nod, this.storeReference, this.storageType))[0]
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

    if (data = json(window[this.storageType].getItem(this.storeReference))) {
      data.forEach(function(data_el, indx) {
        flag = 0 // <- resetting flag to 0
        // checking for coincidences in each of stored object
        // conditions
        for (w in ob.where) flag += (ob.where[w] === data_el[w]) ? 1 : 0
        // nodes that will be returned
        if (flag === whereLength) {
          for (s in ob.set) data[indx][s] = ob.set[s]
        }
      })
      // saving updated object
      window[this.storageType].setItem (
        this.storeReference,
        string(data)
      )
    } else {
      throw new Error('[Store Error]: has been ocurred an error trying to get data from ' + this.storeReference)
    }
  }

  // Find and Sort method
  StormCollection.prototype.findSorted = function (order) {
    var result, orderer, parmOrder
    if (typeof order !== 'string') throw '[Store Error]: Sort parameter should be String type'
    if (!(orderer = order.match(/[<|>]/)[0])) throw '[Store Error]: Error processing'

    parmOrder = order.replace(/[<|>]/, '').trim()
    result = baseFinderMethod(undefined, undefined, this.storeReference, this.storageType)

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
    return !!window[this.storageType].getItem(this.storeReference)
  }

  StormCollection.prototype.on = function (type, callback) {
    if (typeof callback !== 'function') throw new Error ('onSave methods expects a function')
    if (['find', 'save', 'erase', 'update'].indexOf(type) < 0) throw new Error (type + ' is invalid event')

    this.callbackStack[type].push(callback)
  }
  return StormCollection
})
