## js

Holy cow there's a lot of JS stuff out there. Here's a running brain dump.

-	[react](https://facebook.github.io/react/) --- a UI lib; the V in MVC.
	Handles the "structure" of the V and gets data there; doesn't do styling
	(that's still CSS's domain and libs like Bootstrap)

-	[flow](http://flowtype.org/) --- js static type checking

-	[jsx](https://facebook.github.io/jsx/) --- xml-like syntax extension to
	js; lets you write HTML in your js.

-	[babel](https://babeljs.io/) --- js syntactic sugar (e.g. compressed
	functional notation, class/method/var shortcuts, annotations, ...),
	including JSX compiling and stripping out type annotations (e.g. Flow)


## words web hipsters love

-	inject
-	compile
-	render


## React

here's the order of things that happen to a React component:

1.	`getInitialState` &larr; (auto) called to get initial state
2.	`render` &larr; (auto) called to dump HTML or shadow DOM or whatever
3.	`componentDidMount` &larr; (auto) called after first rendered
4.	then as much as you want:
	1.	`setState` &larr; call to set state
	2.	`render` &larr; (auto) called

resources:

-	https://camjackson.net/post/9-things-every-reactjs-beginner-should-know


## Node ORMs

_I'm writing these here to save them before I get the chance to put them in my
own notes._

Writing database queries in your code sucks. Writing them in Javascript
especially sucks; everything is async, and you have to
[waterfall](https://github.com/caolan/async#waterfall) them together just to
make anything work. [Look at how bad this
is](https://gist.github.com/mbforbes/2a778ba828fc9b996a7a). Look at it.

I was originally using a text file. This was a crude approximation for a
spreadsheet, so I switched to a Google Sheet. This was a crude approximation
for a database, so I switched to PostgreSQL (Heroku's default, it seems).

I have a schema; my data makes sense in a table. I don't need no NoSQL.
However, I need a way to get and save data like it's in an object, to avoid the
godawfulness shown above. This is called an object-relational mapping, and
leaves us in a bit of a predicament.

The predicament is: we need to use an ORM library. Because both SQL and noSQL
databases have ORMs, the question of whether the underlying DB has a schema
becomes irrelevant. The question is, instead, which ORM library is most
sophisticated. And by sophisticated I mean "easy to use."

_"Popularity" (below) is a metric I think is dumb and shallow, but does give a
simple number: stars on Github. Perhaps more important is "momentum."_

### SQL

Library | Info | Popularity
--- | --- | ---
[Sequelize](http://sequelizejs.com/) | ORM for PSQL, MySQL, SQLite, MariaDB | 2752
[bookshelf.js](http://bookshelfjs.org/) | ORM for PSQL, MySQL, SQLite3. Built on knex.js | 1463
[persistence.js](https://github.com/coresmart/persistencejs) | DB: MySQL only (plus HTML5, Google Gears, in-memory). (Server + client.) | 1346
[knex.js](http://knexjs.org/) | A SQL query builder | 922

### NoSQL

Library | Info | Popularity
--- | --- | ---
[Mongoose](http://mongoosejs.com/) | Seems to be the Node.js standard. Touts "object modeling tool" as its main feature. | 5714
[Mongoskin](https://github.com/kissjs/node-mongoskin) | "Promise wrapper," built on MongoDB Native. Not ORM?  | 1095
[Mongolia](https://github.com/masylum/mongolia) | "Not an ORM. Helps dealing with data logic. Contains no state, just logic." | 135

### Both
Library | Info | Popularity
--- | --- | ---
[JugglingDB](https://github.com/1602/jugglingdb) | ORM for PSQL, MySQL, SQLite3, couchDB, mongoDB, redis. | 1429
[node-orm](https://github.com/dresende/node-orm2) | ORM for PSQL, MySQL, SQLite, mongoDB | 1115
[Waterline](https://github.com/balderdashy/waterline) | "Uniform API for accessing databases, protocols, APIs...Strives to inherit the best parts of ORMs like ActiveRecord, Hibernate, and Mongoose." | 1037
[CaminteJS](https://github.com/biggora/caminte) | ORM for PSQL, MySQL, SQLite, couchDB, mongoDB, redis, ... | 223
