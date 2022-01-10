Rewritten Universe
==================

.. draw the "fetch" and "load" diagram to show the design

main script::

    with app init:

        config model
        init input fields
        init universe
        activate animation
        hook events

(will) support methods:

    css, svg, canvas, webgl

code structure: main (view, controller, presenter, view model,...), model, encapsulated methods

consideration in this version:
favicon/pintab icon, web app on mobile, twitter/open graph,
layout by HTML/CSS (eg define square black sky), dark mode (only, actually), web component,
assertion as inline doc, a simple unit test framework, MVC, ...

iteration next points, colors
fixed radius at app starting
animation frame
coordinates calculation by matrix
amount would be kept when browser refresh


(then add stars with coorespoding axis ??)
(optimize arithmetic such as linear opacity by 2/3 ??)
(type annotation for NaN ???)


model.js should return class because it requires init (ie constructor)
model.js should export the class by default

modularize by logic;
  browser fetchs modules parallel by listing in HTML,
  fetch async by import statement,
  reuse HTTP connection within HTTP/2 .

invoke event listener to subscribe state (normal <-> slowTrans) change
