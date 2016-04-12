## tutorial list

0.	&check; [React Tutorial](https://facebook.github.io/react/docs/tutorial.html)
0.	&check; [Thinking in React](https://facebook.github.io/react/docs/thinking-in-react.html)
0.	&check; [9 things every React.js beginner should know](https://camjackson.net/post/9-things-every-reactjs-beginner-should-know)
0.	&check; [(video) Dan Abramov - Live React: Hot Reloading with Time Travel](https://www.youtube.com/watch?v=xsSnOQynTHs)


## js

Holy cow there's a lot of JS stuff out there. Here's a running brain dump.

-	[AMD](https://github.com/amdjs/amdjs-api/blob/master/AMD.md) ---
	Asynchronous Module Definition, the API that require.js uses. It's
	specifies how to "define modules such that the module and its dependencies
	can be asynchronously loaded." Contrast to CommonJS (Node's equivalent).
	Require.js defends AMD: http://requirejs.org/docs/whyamd.html.

-	[babel](https://babeljs.io/) --- js "transpiler;" get es6 support by
	compiling down to es5. It also does JSX compiling and strips out Flow type
	annotations.

-	[bower](http://bower.io/) --- frontend package manager using flat
	dependency graph to prioritize small installs.

-	[elm](http://elm-lang.org/) --- functional programming language for
	declaratively creating web GUIs. Uses "functional reactive" programming
	style.

-	[es6](http://git.io/es6features) --- next version of JavaScript spec.
	Seems exciting. Here's another comparison website:
	http://es6-features.org/. This might be better for learning:
	https://babeljs.io/docs/learn-es2015/.

-	[flow](http://flowtype.org/) --- FB's js static type checker

-	[flux](https://facebook.github.io/flux/) --- FB's UI architecture (not a
	code framework). Idea you should have one-way data flow from a dispatcher
	(handles actions), to the One True State, to rendering views. React
	implements the views part.

-	[grunt](http://gruntjs.com/) --- task runner. You might want it to do:
	minification, compilation, unit testing, linting.

-	[gulp](http://gulpjs.com/) --- like grunt, but seems stream and pipe-based.

-	[immutable.js](https://facebook.github.io/immutable-js/) --- FB's
	immutable data collections for javascript.

-	[jest](https://facebook.github.io/jest/) --- FB's javascript unit testing
	library.

-	[jsx](https://facebook.github.io/jsx/) --- xml-like syntax extension to
	js; lets you write HTML in your js.

-	[npm](https://www.npmjs.com/) --- node's package manager. CommonJS is its
	module format.

-	[react](https://facebook.github.io/react/) --- FB's UI lib; the V in MVC.
	Handles the "structure" of the V and gets data there; doesn't do styling
	(that's still CSS's domain and libs like Bootstrap)

-	[redux.js](http://redux.js.org/) --- a state container for JS apps. Can
	use with React (as the view). Represent app data as a store with reducer
	functions for combining [old state] + [action] = [new state]. "Evolves
	ideas of Flux, but avoids its complexity by taking cues from Elm."

-	[require.js](http://requirejs.org/) --- a js file and module loader. Uses
	the AMD API for js modules. This is in contrast to Node's builtin module
	format (CommonJS) and loader (part of Node). They say CommonJS is
	non-optimal for the browser (and presumably AMD is).

-	[reselect](https://github.com/reactjs/reselect) --- Redux library:
	"composable, lazy-evaluated views onto your state." Examples: inject only
	part of the global state tree; inject bits of derived data without putting
	it in the store.

-	[webpack](https://github.com/webpack/webpack) --- bundles js modules.
	"Webpack takes modules with dependencies and generates static assets
	representing those modules." Splits dependency tree into chunks so initial
	loading time is low and chunks can be loaded on demand. Can use CommonJS
	or AMD.

-	[yeoman](http://yeoman.io/) --- scaffold (boilerplate) generator, works
	for many projects (e.g. Angular, Backbone, React, Polymer). Also writes
	your build files (e.g. in Grunt or Gulp) and package manager dependencies
	(e.g. in Bower or npm)


## words web hipsters love

-	inject
-	compile
-	render


## React

### React Tutorial

here's the order of things that happen to a React component:

1.	`getInitialState` &larr; (auto) called to get initial state
2.	`render` &larr; (auto) called to dump HTML or shadow DOM or whatever
3.	`componentDidMount` &larr; (auto) called after first rendered
4.	then as much as you want:
	1.	`setState` &larr; call to set state
	2.	`render` &larr; (auto) called

### Thinking in React

Here's how to build a website using react:

0.	**Mock** --- make a mock

0.	**Data** --- make JSON data that contains data that fills the mock

0.	**Component hierarchy** --- break mock UI into hierarchical components

0.	**Static React** --- build a static version in React. Think of it like
	this: `[data] --[component hierarchy]--> [mock]`. Use _props_, not
	_state_.

0.	**State: what** --- identify minimal state for UI. It should (a) not be
	passed from a parent via props, (b) should change over time, (c) not be
	computable from other state and props.

0.	**State: where** --- identify where state should live. It should flow down
	the component hierarchy into components' props that can be rendered. So,
	look at all components that use a piece of state _s_, and find the lowest
	common parent (or create one). It should live here or higher.

0.	**State: hook it up** --- add listeners to bind UI input at the bottom of
	the component hierarchy to state at the top of the component hierarchy.
	Changes will then cascade down the component hierarchy as props being
	rendered.

Woah, _props v state_?

-	**props** --- don't change; are static.
-	**state** --- changes; is dynamic.

Yes, the example at least really seems to use them: changing things use
_state_, then set the _props_ on sub-things that render themselves; then, the
sub-things think only about their _props_. Cool.

One-way data flow? Yes, React has one-way data flow _down_ the component
hierarchy. This is interesting: typing in a text box updates the top-level
state, which flows down into the components until it reaches the text box
component, which renders the text. So typing in the text box doesn't actually
change it directly! You can see this by having the text box render the state
but not implementing any listeners; the text box won't change when you type in
it.

### 9 things every React.js beginner should know

1.	React is just a V in MVC.
2.	Keep components small (e.g. just a couple `<div>`s).
3.	Write functional components (seems like a personal preference; can't have
	state, different syntax).
4.	Write stateless components (this seems trivial from the tutorial).
5.	Use Redux.js (and a crap ton of other libraries he likes: immutable,
	react-thunk, reselect).
6.	Use `propTypes`, which do dynamic type checking.
7.	Use shallow rendering (for testing).
8.	Use JSX, ES6, Babel, Webpack, and NPM (I added entries above for all).
9.	Use the React and Redux dev tools.

### (video) Dan Abramov - Live React: Hot Reloading with Time Travel

Redux = "reduce" + "flux". It turns a store into a set of reducer functions
which take a previous state and an action and return a new state. It's
abstracted the notion of a store from objects that hold data and return them
into just functions. The framework keeps track of the actual state, calling the
reduce functions, saving the new state, diff'ing the states (states should be
immutable), and calling updates (e.g. `render()`) when needed.

He also shows some pretty cool Redux tooling (Redux DevTools) that lets you
snapshot and replay changes to your state (reduces).

He also shows React HotLoader, which does real-time updates to react views
without having to muck with component creation and deletion. It does this by
proxying out the functions on a React component and then swapping in code with
webpack as needed.

### React plugins

-	`ReactLink` --- "make (the react one-way data flow pattern) as convenient
	as two-way data binding"


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
