class Pathfinder extends Phaser.Scene {
    constructor() {
        super("pathfinderScene");
    }

    preload() {
        // Preload assets if needed
    }

    init() {
        this.TILESIZE = 16; // Original tile size
        this.SCALE = 1;   // Set map scale

        // Define tile groups
        this.tileGroups = {
            grass: [1, 2, 3],
            dirt: [13, 14, 15, 25, 26, 27, 37, 38, 39, 40, 41, 42, 43],
            road: [44],
            greenBush: [7, 8, 9, 19, 20, 21, 31, 32, 33],
            yellowBush: [10, 11, 12, 22, 23, 24, 34, 35, 36],
            greenTree: [5, 17],
            yellowTree: [4, 16],
            well: [93, 105],
            randomBush: [6, 18, 28, 29, 30],
            randomObjects: [58, 84, 94, 95, 96, 104, 106, 107, 108, 116, 117, 118, 119, 120, 128, 129, 130, 131, 132],
            houseGrayTop: [49, 50, 51, 52, 61, 62, 63, 64, 73, 74, 75, 76, 85, 86, 87, 88],
            houseRedTop: [53, 54, 55, 56, 65, 66, 67, 68, 77, 78, 79, 80, 89, 90, 91, 92],
            fence: [45, 46, 47, 48, 57, 59, 60, 69, 70, 71, 72, 81, 82, 83],
            castle: [97, 98, 99, 100, 101, 102, 103, 109, 110, 111, 112, 113, 114, 115, 121, 122, 123, 124, 125, 126, 127]
        };
    }

    create() {
        // Create the tilemap
        this.map = this.add.tilemap("three-farmhouses", this.TILESIZE, this.TILESIZE);

        // Add tileset
        this.tileset = this.map.addTilesetImage("kenney-tiny-town", "tilemap_tiles");

        // Create layers
        this.groundLayer = this.map.createLayer("Ground-n-Walkways", this.tileset, 0, 0);
        this.treesLayer = this.map.createLayer("Trees-n-Bushes", this.tileset, 0, 0);
        this.housesLayer = this.map.createLayer("Houses-n-Fences", this.tileset, 0, 0);

        // Calculate map size in pixels
        const mapWidth = this.map.widthInPixels * this.SCALE;
        const mapHeight = this.map.heightInPixels * this.SCALE;

        // Apply scale to layers
        this.groundLayer.setScale(this.SCALE);
        this.treesLayer.setScale(this.SCALE);
        this.housesLayer.setScale(this.SCALE);

        // Center the camera on the scaled map
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.centerCamera(mapWidth, mapHeight);

        // Listen for window resizing
        this.scale.on('resize', (gameSize) => {
            const { width, height } = gameSize;
            this.centerCamera(mapWidth, mapHeight, width, height);
        });

        // Step 1: Process each layer independently
        const groundGrid = this.extractGridFromLayer(this.groundLayer);
        const treesGrid = this.extractGridFromLayer(this.treesLayer);
        const housesGrid = this.extractGridFromLayer(this.housesLayer);
        console.log("groundLayer:", groundGrid);
        console.log("treesLayer:", treesGrid);
        console.log("housesLayer:", housesGrid);

        // Step 2: Identify clusters for each layer
        const groundClusters = this.findCategorizedClusters(groundGrid);
        const treeClusters = this.findCategorizedClusters(treesGrid);
        const houseClusters = this.findCategorizedClusters(housesGrid);
        console.log("groundLayer:", groundClusters);
        console.log("treesLayer:", treeClusters);
        console.log("housesLayer:", houseClusters);

        // Step 3: Add descriptions to clusters
        const groundClustersWithDescriptions = this.addDescriptionsToClusters(groundClusters);
        const treeClustersWithDescriptions = this.addDescriptionsToClusters(treeClusters);
        const houseClustersWithDescriptions = this.addDescriptionsToClusters(houseClusters);

        // Step 4: Organize and log extracted data
        const extractedData = this.organizeClusterData(
            groundClustersWithDescriptions,
            treeClustersWithDescriptions,
            houseClustersWithDescriptions
        );
        console.log("Extracted Tilemap Data with Descriptions:", extractedData);

        // Optional: Visualize clusters
        this.visualizeClusters(groundClustersWithDescriptions);
        this.visualizeClusters(treeClustersWithDescriptions);
        this.visualizeClusters(houseClustersWithDescriptions);

        // Optional: Export data as JSON
        this.exportClustersAsJSON(extractedData);
    }

    centerCamera(mapWidth, mapHeight, windowWidth = window.innerWidth, windowHeight = window.innerHeight) {
        const offsetX = (windowWidth - mapWidth) / 2;
        const offsetY = (windowHeight - mapHeight) / 2;
        this.cameras.main.setViewport(offsetX, offsetY, mapWidth, mapHeight);
    }

    extractGridFromLayer(layer) {
        const grid = [];
        for (let y = 0; y < this.map.height; y++) {
            grid[y] = [];
            for (let x = 0; x < this.map.width; x++) {
                const tile = layer.getTileAt(x, y);
                grid[y][x] = tile ? tile.index : 0;
            }
        }
        return grid;
    }

    findCategorizedClusters(grid) {
        const clusters = [];
        const visited = new Set();

        const getCategory = (tileID) => {
            for (const [category, ids] of Object.entries(this.tileGroups)) {
                if (ids.includes(tileID)) return category;
            }
            return null;
        };

        const isValidTile = (x, y, targetCategory) =>
            x >= 0 && x < grid[0].length &&
            y >= 0 && y < grid.length &&
            !visited.has(`${x},${y}`) &&
            getCategory(grid[y][x]) === targetCategory;

        const floodFill = (x, y, targetCategory) => {
            const cluster = [];
            const queue = [[x, y]];
            while (queue.length > 0) {
                const [cx, cy] = queue.shift();
                if (!isValidTile(cx, cy, targetCategory)) continue;

                visited.add(`${cx},${cy}`);
                cluster.push([cx, cy]);

                queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
            }
            return cluster;
        };

        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[0].length; x++) {
                const tileID = grid[y][x];
                const category = getCategory(tileID);
                if (category && !visited.has(`${x},${y}`)) {
                    const cluster = floodFill(x, y, category);
                    if (cluster.length > 0) {
                        clusters.push({ category, cluster, boundingBox: this.computeBoundingBox(cluster) });
                    }
                }
            }
        }

        return clusters;
    }

    computeBoundingBox(cluster) {
        const xs = cluster.map(([x]) => x);
        const ys = cluster.map(([_, y]) => y);
        return {
            topLeft: [Math.min(...xs), Math.min(...ys)],
            bottomRight: [Math.max(...xs), Math.max(...ys)]
        };
    }

    addDescriptionsToClusters(clusters) {
        const descriptions = {
            grass: "A patch of grassy land.",
            dirt: "A dirt pathway.",
            road: "A stone road.",
            greenBush: "A group of green bushes.",
            yellowBush: "A group of yellow bushes.",
            greenTree: "A lush green tree.",
            yellowTree: "A bright yellow tree.",
            well: "A small water well.",
            randomBush: "A small bush or mushroom.",
            randomObjects: "Scattered objects like keys and coins.",
            houseGrayTop: "A house with a gray roof.",
            houseRedTop: "A house with a red roof.",
            fence: "A wooden fence.",
            castle: "A towering castle structure."
        };

        return clusters.map(cluster => ({
            ...cluster,
            description: descriptions[cluster.category] || "No description available."
        }));
    }

    organizeClusterData(groundClusters, treeClusters, houseClusters) {
        const allClusters = [
            ...groundClusters.map(cluster => ({ ...cluster, layer: "ground" })),
            ...treeClusters.map(cluster => ({ ...cluster, layer: "trees" })),
            ...houseClusters.map(cluster => ({ ...cluster, layer: "houses" }))
        ];

        return {
            clusters: allClusters,
            totalClusters: allClusters.length
        };
    }

    visualizeClusters(clusters) {
        const graphics = this.add.graphics();

        clusters.forEach(cluster => {
            const { topLeft, bottomRight } = cluster.boundingBox;
            const color = 0x00ff00;

            graphics.lineStyle(2, color, 1);
            graphics.strokeRect(
                topLeft[0] * this.TILESIZE,
                topLeft[1] * this.TILESIZE,
                (bottomRight[0] - topLeft[0] + 1) * this.TILESIZE,
                (bottomRight[1] - topLeft[1] + 1) * this.TILESIZE
            );
        });
    }

    exportClustersAsJSON(data, filename = "tilemap_clusters.json") {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    update() {
        // No logic for this simplified setup
    }
}
