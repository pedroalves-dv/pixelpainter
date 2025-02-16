# Pixel Painter


This site showcases the Pixel Painter project, an interactive pixel art drawing application with various features to enhance the user experience.

## Live Demo

→ [Pixel Painter](https://pedroalves-dv.github.io/pixelpainter/)
[./assets/pixelpainter-screenshot.jpg](https://pedroalves-dv.github.io/pixelpainter/)

## Features

### 🖌️ Interactive Canvas

- **Description**: An interactive canvas where users can draw pixel art. Supports click and drag.
- **Implementation**: Users can draw on the canvas, and the drawing state is managed using JavaScript.

### 📐 Grid Customization

- **Description**: Users can customize the size of the grid, the size of the tiles or "pixels" and "Create" a fresh canvas.
- **Implementation**: The grid and pixel slider inputs allow the users to change the canvas specifications, and the "Create" button generates a new canvas.

### ↩️ Undo / Redo Feature

- **Description**: Users can undo and redo their actions while drawing.
- **Implementation**: Records drawing state and allows users to revert or reapply their last actions through the undo and redo buttons.

### 🎨 Color Palette

- **Description**: Select and apply colors to individual pixels.
- **Implementation**: Color palette nav section whith "active color" visual aid.

### 💾 Export Function

- **Description**: Users can export the canvas as an image file.
- **Implementation**: The export button allows users to save their drawings as a JPG file.

## Technologies Used

- **HTML**: For structuring the content.
- **CSS**: For styling the website.
- **JavaScript**: For interactive features and dynamic content.
- **LocalStorage**: For persisting user preferences and drawing progress.

## Getting Started

1. Clone the Repository

```sh
 git clone https://github.com/pedroalves-dv/pixelpainter.git
 cd pixelpainter
```

2. Open `index.html`

Simply open the `index.html` file in your preferred web browser.

## Roadmap & Future Improvements

- Add various canvas types, brushes and other tools
- More advanced export options (GIF, SVG, etc.)

## Contributing

Contributions are welcome. Feel free to fork this repository and submit a pull request with enhancements or bug fixes.

## License

This project is licensed under the **MIT License** – feel free to use, modify, and distribute.

## Contact

For any inquiries, please contact me at [pedroalves.dv@gmail.com].
