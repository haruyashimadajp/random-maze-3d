# Random Maze 3D

A web-based 3D random maze generator and exploration game built with JavaScript and p5.js. This project serves as my first milestone as a software engineer, demonstrating foundational skills in spatial algorithms, 3D graphics rendering, and performance optimization.

## 🎮 Live Demo

Experience the maze directly in your browser:
[**Play Random Maze 3D (p5.js Web Editor)**](https://editor.p5js.org/sh_arschool/full/_wD2tj4gy)

## ⌨️ Controls

* **Movement:** `W`, `A`, `S`, `D` keys
* **Camera (Look around):** `Arrow Keys`

## ✨ Key Features & Technical Highlights

### 1. Guaranteed Solvability

The core algorithm is designed to ensure that the maze is not just a collection of random walls. It guarantees a **valid and reachable path** from the starting point to the goal in every generated instance, providing a consistent gameplay experience.

### 2. Rendering Optimization for Performance

To ensure smooth gameplay even as the maze complexity increases, I implemented specific optimization techniques:

* **Dynamic Culling:** The program logic prevents rendering walls that are outside a specific radius from the player. This significantly reduces the processing load on the GPU.
* **Atmospheric Depth Shading:** Distant walls are rendered with a "fog" or shadow effect, gradually getting darker as they move away from the player. This not only enhances the atmosphere but also naturally masks the boundaries of the rendered area.

## 🛠️ Technologies Used

* **JavaScript (ES6+)**
* **p5.js:** Used for WEBGL 3D rendering and canvas management.
* **Mersenne Twister (mt.js):** Employed for high-quality pseudo-random number generation to ensure varied maze patterns.
* **HTML5 / CSS3**

## 🚀 Getting Started

To run this project locally:

1. Clone the repository:

```
git clone https://github.com/haruyashimadajp/random-maze-3d.git
```

2. Navigate to the project directory:

```
cd random-maze-3d
```

3. Open `index.html` in any modern web browser.

## 📄 License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.
