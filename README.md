Plainview
=====
Operated by: Jordan Coimbra, Daniel Balagula

##Current Bugs:
- ~~deselecting highlighted text selects a response node (it shouldn't)~~ Fixed 10/19/2016
- ~~page doesn't immediately add node to graph when user makes a response (it should)~~ Fixed 11/03/2016
- ~~long words don't wrap around response node (they should)~~ Fixed 10/21/2016
- ~~typeahead.js suggestion dropdown doesn't show (it should)~~ Fixed 10/20/2016
- mouse selecting nodes is not as fluid as it could be
- labels for form info overflow when screen is tight (they shouldn't)
- ~~edge styles have grey at the ends (they shouldn't)~~ Altered: edge styles don't represent response relationships
- ~~lines wrap and break in-between words (they shouldn't)~~ Fixed 11/06/2016
- ~~line breaks sometimes go beyond node widths (they shouldn't)~~ Fixed 11/06/2016
- ~~responses' original uses are not recorded (they should be)~~ Fixed 10/24/2016

##To Do:
- Create middleware for authentication/last_post checking.. currently just doing if statements (POST responses, discussions)
- Create preview data field for responses that is shown for browsing to decrease bandwidth
- ~~Response signature/created_by should be sorted out (?)~~
- Create node-information objects that hold ids, values, etc.
- Why do I have to render twice to get rid of formatting inconsistensies?
- Figure out how to mark when someone left a debateExerience server-side. Or just clear when they disconnect? What is the best way?
- POSTs need time in-between attempts so that server doesn't get ddosed/overloaded
- Reply div closes without checking if the AJAX request was succressful or not... people would lose data. Find out how to structure this well
- ~~Serve favicon!!~~ Completed 11/03/2016
- Add response type options when citing/writing a response
- Add user accounts and authentication/authorization~~
  -~~Passport local/fb/google~~
  -~~Passport mongoose~~
  -~~Express session~~
  -~~SSL certificate
- Decide how to structure and limit article citation so that graphs dont' get mixed up
- Refactor interface.js
- Currently inputTemplate's 'display' string is being replaced a string that has 'inline-block'... HOW CRAZY IS THAT... but is it the best solution?
- ~~link a citation instead of writing an argument as a response~~ Completed 10/19/2016
- implement article data type
- accept JSON request from client
- add comments to debate experiences and arguments
- text highlighting and quoting
- ~~style edges between response nodes based on response type~~ Completed 10/20/2016
- implement better argument title suggestion algorithm/api
- editing previous arguments and keeping a version history of arguments
- implement search box
- ~~implement filters for queries~~ Completed 10/25/2016
- ~~make buttons for response types look better~~ Altered: responses won't be happening with one field on the right side
- style selected/unselected nodes better
- ~~implement max/min zoom~~
- ~~implement tags (possibly?)~~
- ~~add a meta data structure in db that holds things like arguments that cite, etc.~~ Completed 10/22/2016
- look into potential usability of: http://cpettitt.github.io/project/dagre-d3/latest/demo/clusters.html
- ~~Get Handlebars to work on server and client sides instead of using two different templating engines~~ Altered: not necessary because there isn't a redundance of client-slide templating libaries
- implement Require.js: http://requirejs.org/docs/start.html
- implement Browserify: http://browserify.org/
- figure out best place to put responseTemplate
- a better way to getting relationship types when drawing nodes
- ~~Fix adding response when zoomed~~ Completed 10/24/2016
- ~~redo title finding to make it filter-based and use /responses with req.body.filter to specify titles~~ 
- create a route for popular/featured responses that will show in the responseBrowser (instead of all responses)
- current implementation of Underscore.js templating for responseBrowser, responseInput, and responseNode are all dubious, especially responseBrowser.. look for better alternatives
- ~~evaluate whether ajax call for prefetched resposnes should happen before, during, or after initial graph rendering~~
- implement responseBrowser auto-search after the user has stopped typing for a few seconds, so they don't have to click "Search"
- there's no efficient connection between responseBrowser results and using them in the code... currently using grep

##Mottos:
- Test all possible solutions, no matter how cryptic the code
- Know the limitations of the libraries you find before you use them
- Reflect upon all design decisions

##Questions:
- ~~Do we want to have transitions in the graph?~~ Yes
- How would having a slightly grey background look on the graph?
- Should we implement tags?
- What font do we want arguments to use?
- What restrictions will we place on user input? (word length, characters, allowable words, etc.)
- Do we want edges to be curved or rigid? Rigid
- Do we want a seperate data structure for argument titles? What is the performance difference?
- Do we want to denormalize certain data structures (Holding aggregate values instead of complex queries)? <- Will have to measure performance evetually
- Is it more efficient to register a reply button click on a node click, or is it more efficient to have a unique id to each reply button?
