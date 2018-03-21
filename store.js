
(function (global, factory) {

	global.Collection = factory();

}) (this, function () {

	function isArray(s) {
		return typeof s === 'object' &&
		s.length !== undefined &&
		s.length !== null;
	}

	// checking for native localStorage support
	let support = function support () {
		return localStorage !== undefined && localStorage !== null;
	}

	if (!support) throw '[Store Error]: localStorage is not supported!';

	// initializing Store class model
	let Storaged = function (str) {
		this.collection = str;
	}

	// Save method
	Storaged.prototype.save = function (ob) {
		let data;

		// check for correct type of parameter
		// it should be an object
		if  (typeof ob !== 'object') throw '[Store Error]: "save" method expect a JSON';

		// check if register exists
		if ( data = JSON.parse(localStorage.getItem(this.collection)) ) {
			data.push(ob);
			localStorage.setItem(this.collection, JSON.stringify(data));
		} else {
			// insert data for first time
			data = []
			data.push(ob)
			localStorage.setItem(this.collection, JSON.stringify(data));
		}
	}

	// Delete method
	Storaged.prototype.delete = function () {
		localStorage.removeItem(this.collection);
	}

	// Find method
	Storaged.prototype.find = function (values, nod) {
		let data, tmp = [], tmpRefactor = {};

		// if values is defined
		if (values) {
			if (typeof values !== 'object') throw '[Store Error]: "find" method expect a JSON';
			data = JSON.parse(localStorage.getItem(this.collection));

			// if the node is defined, it responds
			// only with the requested nodes
			if (nod && typeof nod === 'string') {

				for (var __j_key in values) {
					data.forEach(function(el) {
						if (el[__j_key] == values[__j_key]) {
							(nod.split(/ +/g)).forEach(function(nodMirror) {
								tmpRefactor[nodMirror] = el[nodMirror];
							});
							tmp.push(tmpRefactor);
							tmpRefactor = {};
						}
					})
				}
			// else, request all nodes
			} else {

				for (var __j_key in values) {
					data.forEach(function(el) {
						if (el[__j_key] == values[__j_key]) {
							tmp.push(el);
						}
					})
				}

			}
			// this returns a single object if node.length is 1
			// else, returns an array
			// -------
			// return (tmp.length === 0) ? undefined : ( (tmp.length === 1) ? tmp[0] : tmp );
			// -------
			// return nodes
			return tmp;
		} else {
			return JSON.parse(localStorage.getItem(this.collection));
		}
	}

	Storaged.prototype.findOne = function (values, nod) {

	};

	// update method
	Storaged.prototype.update = function (ob) {
		if (!ob.set) throw '[Store Error]: "set" node missing';
		if (!ob.where) throw '[Store Error]: "where" node missing';

		if (typeof ob.where !== 'object' && typeof ob.set !== 'object') {
			throw '[Store Error]: "Where" or "Set" node expects objects';
		}


		let data,
				rules = [],
				setterLength = 0,
				whereLength = 0,
				flag;

		// checking for all avalible setters
		for(s in ob.set) {
			setterLength++;
		}

		// check for all conditions
		for(w in ob.where) {
			whereLength++;
		}

		if (data = JSON.parse(localStorage.getItem(this.collection))) {


			data.forEach(function(data_el, indx) {
					flag = 0; // <- resetting flag to 0
					// checking for coincidences in each of stored object
					// conditios
					for (w in ob.where) {
						flag += (ob.where[w] === data_el[w]) ? 1 : 0;
					}

					// nodes
					if (flag === whereLength) {
						for (s in ob.set) {
							data[indx][s] = ob.set[s];
						}
					}
			})

			// saving updated object
			localStorage.setItem(this.collection, JSON.stringify(data))

		} else {
			throw '[Store Error]: has been ocurred an error trying to get data from ' + this.collection;
		}
	};

	return Storaged;

});
