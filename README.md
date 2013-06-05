joke
====

Simple Javascript 2D engine, that uses layered handling. 
Features:
* Support of many independent objects  simultaneously;
* Moving objects.
*  Released: straightforward, angular, circular (around custom point),along bezier curve
* Collisions between object and another objects, between objects and edges of scene;
* Rotation around center of object;
* Keyboard interacting
* Sprites animation

Nearly planned : tiles, mouse  interacting. 
Farly planned : different velocities of objects, adding special background layer, and build simple game

Principles of usage:
 * Subclass sceneObject 
 * Customize movement  function (default is linear movement), if need it
 * Customize collision rules
 * Use for creating sprites and background

