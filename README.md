
![Storm JS logo](./logo.png)

# Storm
###### 0.4.0 [BETA]

this library provides a light but powerful way to handle localStorage javascript data, in a simple CRUD.

### Implementation

storm follows a collections philosophy, in this case we can create data groups using `Collection` method.

```js
const cats = new Collection('nameReference')
```
`nameReference` will be used for save and get data from localStorage, it's advisable to use descriptive names, it can be the same as `cats` variable.

in case 2 variables use the same collection, like this.

```js
const cats = new Collection('cats')
const coolestCats = new Collection('cats')
```
both variables (`cats`, `coolestCats`) will have an impact on the same data.

---

### CRUD
---
#### Create

for save data (assuming we use the cats collection) you just need to run the save method of `cats` and pass a JSON argument with "the cat information", like this.

```js
cats.save({
   name: 'Sparky',
   age: 4,
   color: 'brown'
})
```
for each execution of this method, a new object is saved, then, let's keep 2 more cats.
```js
cats.save({
   name: 'Pillow paws',
   age: 6,
   color: 'white'
})

cats.save({
   name: 'Destroyer',
   age: 6,
   color: 'brown'
})
```
---
#### Read

at the time of reading we have 3 options:

1. get the entire collection.
2. get a part of the collection.
3. get specific nodes from a part of the collection.

## [1]
we can invoke the `find` method without parameters, on a collection, like this.

```js
cats.find()

// returns entire in a JSON
[{
   name: 'Sparky',
   age: 4,
   color: 'brown'
},{
   name: 'Pillow paws',
   age: 6,
   color: 'white'
},{
   name: 'Destroyer',
   age: 6,
   color: 'brown'
}]
```

## [2]
we can invoke the `find` method passing an object as a parameter, this object contains the conditions that `the cat` (in this case) must fulfill, like this.

```js
cats.find({
   color: 'brown'
})

// returns only cats that are brown
[{
   name: 'Sparky',
   age: 4,
   color: 'brown'
},{
   name: 'Destroyer',
   age: 6,
   color: 'brown'
}]
```
we can use more than 1 condition.
```js
// find ( conditions )
cats.find({
   color: 'brown',
   age: 4
})

// returns
[{
   name: 'Sparky',
   age: 4,
   color: 'brown'
}]
```

## [3]
if we pass as a last parameter a string defining which fields we want to recover, then we will only obtain those fields, like this.

```js
// find ( conditions, fields )

cats.find({
   color: 'brown'
}, 'name age') // <- separated by spaces

// returns
[{
   name: 'Sparky',
   age: 4
},{
   name: 'Destroyer',
   age: 6
}]
```

---

you can too use `findOne` method, that returns the first coincidence.

```js
// findOne ( conditions, fields )
cats.findOne({
   color: 'brown'
}, 'name age')

// returns
{
   name: 'Sparky',
   age: 4
}
```
---
#### Update

the update method recive 1 parameter, a JSON with 2 main nodes `where` and `set`.
```js
cats.update({
   where: {
      // conditions
   },
   set: {
      // updates
   }
})
```
For example, if we want all brown cats to be 8 years old, we write the following.

```js
cats.update({
   where: {
      color: 'brown'
   },
   set: {
      age: 8
   }
})
```
there may be more than one condition and more than one data to update.
```js
cats.update({
   where: {
      color: 'brown',
      age: 8
   },
   set: {
      name: 'Kitties',
      newField: 'this cat was affected'
   }
})

cats.find()

// now returns
[{ // cat 1
   name: 'Kitties',
   age: 8,
   color: 'brown',
   newField: 'this cats was affected'
},{ // cat 2
   name: 'Pillow paws',
   age: 6,
   color: 'white'
},{ // cat 3
   name: 'Kitties',
   age: 8,
   color: 'brown',
   newField: 'this cat was affected'
}]
```
---
#### Delete

the simplest method.
```js
cats.delete()
```
remove all data from collection.

###### storm is currently in beta, wait for more soon...
