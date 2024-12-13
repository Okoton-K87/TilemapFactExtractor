// Jim Whitehead
// Created: 5/26/2024
// Phaser: 3.80.0
//
// Pathfinder demo
//
// An example of pathfinding in Phaser using the EasyStar.js pathfinder 
// https://github.com/prettymuchbryce/easystarjs
// 
// Assets from the following Kenney Asset packs
// Tiny Dungeon
// https://kenney.nl/assets/tiny-dungeon
//
// Tiny Town
// https://kenney.nl/assets/tiny-town
//


// // game config
// let config = {
//     parent: 'phaser-game',
//     type: Phaser.CANVAS,
//     render: {
//         pixelArt: true  // prevent pixel art from getting blurred when scaled
//     },
//     width: 1280,
//     height: 800,
//     scene: [Load, Pathfinder]
// }

// var cursors;
// const SCALE = 2.0;
// var my = {sprite: {}};

// const game = new Phaser.Game(config);

// Jim Whitehead
// Created: 5/26/2024
// Phaser: 3.80.0
//
// Pathfinder demo
//
// Dynamically resizable Phaser game configuration for Fact Extractor project.
// 

// Game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true // Prevent pixel art from getting blurred when scaled
    },
    width: window.innerWidth, // Automatically match the browser's width
    height: window.innerHeight, // Automatically match the browser's height
    scale: {
        mode: Phaser.Scale.RESIZE, // Automatically resize with the browser window
        autoCenter: Phaser.Scale.CENTER_BOTH // Center the game canvas
    },
    scene: [Load, Pathfinder] // Include your scenes
};

var cursors; // Input keys (unused here but left for reference)
var my = { sprite: {} }; // Global object for sprites

// Create a new Phaser game with the configuration
const game = new Phaser.Game(config);

// Optional: Handle window resizing to update game dimensions
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});
