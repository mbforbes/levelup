# levelup
Track minutes, gain experience for skills and levels, fight bosses, get rewards. [Live alpha](http://rhubarb-crisp-2752.herokuapp.com/).

![preview of the levelup UI](levelup_ui.png)
_A mockup of the UI I made (in Word!)_

## Development plan

### 1. Switch current models over to MongoDB + Mongoose
- [X] Make sure this is the right way to do a list of check boxes.
- [ ] Define models
- [ ] Match current functionality, which appears to be loading the basic page w/o bosses or rewards & a simple edit (+add) functionality.
- [ ] Cleanup the implementation to remove all CSV parsing crap, and all PG query crap. The data model that the old functions return might be so ingrained in the current code that it might just be worth starting fresh.
- [ ] Address TODOs to clean up the code.
- [ ] Hook up mongo to Heroku.
- [ ] Hook up mongo backups with Heroku. Extra credit: actually test this.
- [ ] Disable PG & PG backups.

### 2. Entire frontend should be async (Ajax)
- [ ] Controller should query # skills (abilities? can't remember nomenclature...) to select model (how many bootstrap columns)
- [ ] View should grab models from backend to populate
- [ ] Models in frontend should use backbone.js (or something else) so they can be updated effortlessly
- [ ] All models on page should update easily with a single mechanism, either cued by input or by a periodic refresh (e.g. every 10 seconds).

### 3. Implement add / edit / delete
- [ ] Abilities (if not already done)
- [ ] Bosses
- [ ] Rewards (code reuse with bosses?)

### 4. Implement rest of main page UI
- [ ] Bosses
- [ ] Rewards

### 5. Polish
- [ ] favicon.ico

## Deprecated: Setup
You need two files, which are both one-liner filess with URLs to an **old** Google Docs Spreadsheet with certain data format.
- `exp_url` :   exp format (specified in web.js)
- `abilities_url` : abilities format (specified in web.js)

## Related work
After having done my brainstorming, background research on why games are addicting, needs analysis, level math and balancing, mockups, and most of the backend / frontend coding, I then discovered [HabitRPG](https://habitrpg.com/).

This will be a simple, less-featured version of HabitRPG, which only tracks habits (and not TODOs and the rest). It also won't have pretend rewards.

Why not switch over to HabitRPG? Here is why I'm going to continue development on `levelup` instead:

* HabitRPG tries to get you to track too much, and all those extra features I don't need will distract me from what I really care about (establishing daily habits).

* HabitRPG has ads, and a cluttered UI to support the above.

* It's really easy to cheat HabitRPG. I made an account and clicked that I did something fifty times, and got tones of rewards. The whole reason RPGs are addicting is that you can't cheat. As sooon as I turn cheats on in any game, it loses all its appeal


## Acknowledgements
The UI is heavily inspired by Persona 3: FES for the PS2. The concept is as well (addicting JRPGs...). So, hats off to the developers of P3FES!


## Appendix: Dev Notes on Databases
_I'm writing these here to save them before I get the chance to put them in my own notes._

Writing database queries in your code sucks. Writing them in Javascript especially sucks; everything is async, and you have to [waterfall](https://github.com/caolan/async#waterfall) them together just to make anything work. [Look at how bad this is](https://gist.github.com/mbforbes/2a778ba828fc9b996a7a). Look at it.

I was originally using a text file. This was a crude approximation for a spreadsheet, so I switched to a Google Sheet. This was a crude approximation for a database, so I switched to PostgreSQL (Heroku's default, it seems).

I have a schema; my data makes sense in a table. I don't need no NoSQL. However, I need a way to get and save data like it's in an object, to avoid the godawfulness shown above. This is called an object-relational mapping, and leaves us in a bit of a predicament.

The predicament is: we need to use an ORM library. Because both SQL and noSQL databases have ORMs, the question of whether the underlying DB has a schema becomes irrelevant. The question is, instead, which ORM library is most sophisticated. And by sophisticated I mean "easy to use."

_"Popularity" (below) is a metric I think is dumb and shallow, but does give a simple number: stars on Github. Perhaps more important is "momentum."_

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

