import React, { Component } from "react";
import Slider from "@material-ui/core/Slider";
import "./PathfindingVisualizer.css";
import Node from "../Node/Node";
import Buttons from "../Buttons/Buttons";
import { dfs } from "../../algorithms/dfs";
import { bfs } from "../../algorithms/bfs";
import {
  dijkstra,
  getNodesInShortestPathOrder,
} from "../../algorithms/dijkstra";
import { astar } from "../../algorithms/Astar";

const ROWS = Math.floor(window.innerHeight / 60);
const COLS = Math.floor(window.innerWidth / 50);

const START_NODE_ROW = Math.floor(ROWS / 2);
const START_NODE_COL = Math.floor(COLS / 5);
const FINISH_NODE_ROW = Math.floor(ROWS / 2);
const FINISH_NODE_COL = Math.floor((COLS * 4) / 5);

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    // this.handleLoad = this.handleLoad.bind(this);
    this.state = {
      grid: [],
      gridNeedsReset: false,
      isRunning: false,
      algorithm: "dijkstra",
      mouseIsPressed: false,
      speed: 20,
    };
  }

  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({ grid });
    // window.addEventListener("load", this.handleLoad);
  }

  componentWillUnmount() {
    // window.removeEventListener("load", this.handleLoad);
  }

  componentDidUpdate() {
    console.log("Grid Updated");
  }

  handleLoad() {
    this.generateBorder();
  }

  handleMouseDown(row, col) {
    const grid = this.state.grid;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    this.setState({ grid: newGrid, mouseIsPressed: true });
  }

  handleMouseEnter(row, col) {
    const mouseIsPressed = this.state.mouseIsPressed;
    const grid = this.state.grid;
    if (!mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    this.setState({ grid: newGrid });
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false });
  }

  handleButtons = (event) => {
    const algorithm = this.state.algorithm;
    const gridNeedsReset = this.state.gridNeedsReset;
    switch (event) {
      case "dfs":
        this.setState({ algorithm: "dfs" });
        break;
      case "bfs":
        this.setState({ algorithm: "bfs" });
        break;
      case "dijkstra":
        this.setState({ algorithm: "dijkstra" });
        break;
      case "astar":
        this.setState({ algorithm: "astar" });
        break;
      case "mazeRand":
        this.generateRand();
        break;
      case "start":
        if (!gridNeedsReset) {
          if (algorithm === "dfs") {
            this.visualizeDFS();
            this.setState({ gridNeedsReset: true });
          } else if (algorithm === "bfs") {
            this.visualizeBFS();
            this.setState({ gridNeedsReset: true });
          } else if (algorithm === "dijkstra") {
            this.visualizeDijkstra();
            this.setState({ gridNeedsReset: true });
          } else if (algorithm === "astar") {
            this.visualizeAstar();
            this.setState({ gridNeedsReset: true });
          }
        } else {
          //clear the board
          const newGrid = clearGrid();
          this.setState({ grid: newGrid, gridNeedsReset: false });
        }
        break;
      default:
        console.warn("handle button has no such state: " + event);
        break;
    }
  };

  changeSpeed(speed) {
    this.setState({ speed: speed });
  }

  animateAlgorithm(visitedNodesInOrder, path) {
    const speed = this.state.speed;
    const hasSolution = !!path ? path.slice(-1)[0].isFinish : false;
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animatePath(path, hasSolution);
        }, speed * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if (!hasSolution && i === visitedNodesInOrder.length - 1) {
          document.getElementById(
            `node-${START_NODE_ROW}-${START_NODE_COL}`
          ).className = "node node-visited";
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-visited node-sad";
        } else if (i === 0) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-calculating node-visited";
        } else if (hasSolution && visitedNodesInOrder[i].isFinish) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-finish node-visited";
        } else {
          if (
            document.getElementById(`node-${node.row}-${node.col}`)
              .className === "node node-visited"
          ) {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              "node node-visited-again";
          } else {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              "node node-visited";
          }
        }
      }, speed * i);
    }
  }

  animatePath(path, hasSolution) {
    const speed = this.state.speed;
    for (let i = 0; i < path.length; i++) {
      setTimeout(() => {
        const node = path[i];
        if (hasSolution && i === path.length - 2) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-start node-shortest-path";
        } else if (hasSolution && i === path.length - 1) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-finish node-shortest-path";
        } else if (hasSolution) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-shortest-path";
        }
      }, speed * i);
    }
  }

  visualizeDFS() {
    console.log("Visualize DFS");
    const { grid } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const { visitedNodesInOrder, path } = dfs(grid, startNode, finishNode);
    this.animateAlgorithm(visitedNodesInOrder, path);
  }

  visualizeBFS() {
    console.log("Visualize BFS");
    const { grid } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = bfs(grid, startNode, finishNode);
    const path = getNodesInShortestPathOrder(startNode, finishNode);
    this.animateAlgorithm(visitedNodesInOrder, path);
  }

  visualizeDijkstra() {
    console.log("Visualize Dijkstra's");
    const { grid } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(
      startNode,
      finishNode
    );
    this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  visualizeAstar() {
    console.log("A* Search");
    const { grid } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = astar(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(
      startNode,
      finishNode
    );
    this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  generateBorder() {
    //unfinished
    const newGrid = this.state.grid.slice();
    for (let row = 0; row < newGrid.length; row++) {
      for (let col = 0; col < newGrid[0].length; col++) {
        setTimeout(() => {
          if (!newGrid[row][col].isFinish && !newGrid[row][col].isStart) {
            const node = newGrid[row][col];
            const newNode = {
              ...node,
              isWall: true,
            };
            newGrid[row][col] = newNode;
          }
        }, 10 * (col + 10 * row));
      }
    }
    this.setState({ grid: newGrid });
  }

  generateRand() {
    const newGrid = generateRandWalls(this.state.grid);
    this.setState({ grid: newGrid });
  }

  render() {
    const { grid, mouseIsPressed } = this.state;
    const speed = this.state.speed;
    const algorithm = this.state.algorithm;
    return (
      <>
        {/* Buttons */}
        <Buttons handleButtons={this.handleButtons} algorithm={algorithm} />

        <div className="instructions">
          <span>Pick an algorithm and hit Start!</span>
        </div>
        <div className="grid" onMouseLeave={() => this.handleMouseUp()}>
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const { row, col, isFinish, isStart, isWall } = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="discrete-slider">
          <span className="discrete-slider-text">Speed</span>
          <Slider
            value={speed}
            onChange={(e, val) => this.changeSpeed(val)}
            defaultValue={30}
            getAriaValueText={valuetext}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            step={10}
            marks={marks}
            min={10}
            max={110}
            style={{
              ...styles.slider,
            }}
          />
        </div>
      </>
    );
  }
}
const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < COLS; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};
const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};
const getNewGridWithWallToggled = (grid, row, col) => {
  if (grid[row][col].isFinish || grid[row][col].isStart) {
    return grid;
  }
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

const generateRandWalls = (grid) => {
  const newGrid = grid.slice();
  for (let row = 0; row < newGrid.length; row++) {
    for (let col = 0; col < newGrid[0].length; col++) {
      const makeWall = Math.round(Math.random() * 0.7);
      if (makeWall && !grid[row][col].isFinish && !grid[row][col].isStart) {
        const node = newGrid[row][col];
        const newNode = {
          ...node,
          isWall: !node.isWall,
        };
        newGrid[row][col] = newNode;
      }
    }
  }
  return newGrid;
};
const clearGrid = () => {
  const grid = [];
  for (let row = 0; row < ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < COLS; col++) {
      const node = createNode(col, row);
      currentRow.push(node);
      if (node.isFinish) {
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-finish";
      } else if (node.isStart) {
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-start";
      } else {
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node";
      }
    }
    grid.push(currentRow);
  }
  return grid;
};
function valuetext(value) {
  return `${value}ms`;
}
const marks = [
  {
    value: 10,
    label: "10ms",
  },
  {
    value: 60,
    label: "60ms",
  },
  {
    value: 110,
    label: "110ms",
  },
];
const styles = {
  slider: {
    color: "#66a182",
  },
};
