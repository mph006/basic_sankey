Basic Sankey Diagram + Hierarchy

Inspiration from:

http://bl.ocks.org/d3noob/c9b90689c1438f57d649

http://bl.ocks.org/Neilos/584b9a5d44d5fe00f779

http://bl.ocks.org/d3noob/5028304

To Run:

//Get dependencies

~/ > npm install

//Generate a data set

~/server_side > python dataGenerator.py [iterations]

//Generate the hierarchy and graph json

~/server_side > node generateTreeAndGraph.js 

//Serve it up

~/client_side > node app.js 

localhost:8088
