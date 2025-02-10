const app = {
  gridSize: 20,
  pixelSize: 30,
  activeColor: "color1",
  board: document.getElementById("invader"),
  exportCanvasElement: document.getElementById("export-canvas"),
  form: document.querySelector(".configuration"),
  history: [],
  historyIndex: -1,
  styles: [
    "color1",
    "color2",
    "color3",
    "color4",
    "color5",
    "color6",
    "color7",
    "color8",
    "color9",
    "color10",
    "color11",
    "color12",
    "color13",
    "color14",
    "color15",
    "color16",
  ],
  init: function () {
    // If there's a saved board state in localStorage, load it
    const savedState = localStorage.getItem("pixelpainter-board");
    if (savedState) {
      app.board.innerHTML = savedState;
    } else {
      // Otherwise, create a blank board
      app.drawBoard();
    }
    app.drawBoard();
    app.drawFormWithSliders();
    app.drawPalette();
    app.enableDrawing();
    app.saveState();
  },
  createButton: function (textTitre) {
    let button = document.createElement("button");
    button.textContent = textTitre;
    button.className = "input-button";
    return button;
  },
  drawBoard: function () {
    app.board.innerHTML = "";
    for (let i = 0; i < app.gridSize; i++) {
      let ligne = document.createElement("div");
      ligne.className = "ligne";
      for (let j = 0; j < app.gridSize; j++) {
        let pixel = document.createElement("div");
        pixel.classList.add("pixel");
        pixel.style.width = app.pixelSize + "px";
        pixel.style.height = app.pixelSize + "px";
        ligne.appendChild(pixel);
      }
      app.board.appendChild(ligne);
    }
    // app.board.addEventListener("click", app.handlePixelClick);
    app.enableDrawing();
  },
  handlePixelClick: function (event) {
    const element = event.target;
    if (!element.classList.contains("pixel")) return;

    // Remove all palette--* classes
    app.styles.forEach((style) => {
      element.classList.remove("palette--" + style);
    });
    // Add the currently active color
    element.classList.add("palette--" + app.activeColor);

    // After each valid pixel click, save the state
    // app.saveState();
    console.log(app.history);
  },
  enableDrawing: function () {
    let isDrawing = false;
    const pixels = document.querySelectorAll(".pixel");

    pixels.forEach((pixel) => {
      // Press down to start drawing
      pixel.addEventListener("mousedown", (event) => {
        event.preventDefault();
        isDrawing = true;
        // Paint the pixel right away
        app.handlePixelClick(event);
      });

      // Move over pixels while the mouse is down to keep painting
      pixel.addEventListener("mousemove", (event) => {
        if (isDrawing) {
          app.handlePixelClick(event);
        }
      });

      // Release to finish drawing, record a single history entry
      pixel.addEventListener("mouseup", (event) => {
        event.preventDefault();
        if (isDrawing) {
          app.saveState(); // store the final board state
        }
        isDrawing = false;
      });
    });

    // If the mouse leaves the board mid-drag, stop drawing.
    app.board.addEventListener("mouseleave", () => {
      isDrawing = false;
    });
  },
  createSlider: function (id, label, min, max, value, step) {
    let sliderContainer = document.createElement("div");
    sliderContainer.className = "slider-container";
    let sliderLabel = document.createElement("label");
    sliderLabel.textContent = label;
    let slider = document.createElement("input");
    slider.setAttribute("type", "range");
    slider.setAttribute("id", id);
    slider.setAttribute("min", min);
    slider.setAttribute("max", max);
    slider.setAttribute("value", value);
    slider.setAttribute("step", step);
    let valueSpan = document.createElement("span");
    valueSpan.textContent = value;
    sliderContainer.appendChild(sliderLabel);
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(valueSpan);
    return sliderContainer;
  },
  drawFormWithSliders: function () {
    app.form.innerHTML = "";

    const gridSizeSlider = app.createSlider(
      "grid-size-slider",
      "Grid Size",
      1,
      70,
      app.gridSize,
      1
    );
    app.form.appendChild(gridSizeSlider);

    const pixelSizeSlider = app.createSlider(
      "pixel-size-slider",
      "Pixel Size",
      10,
      100,
      app.pixelSize,
      10
    );
    app.form.appendChild(pixelSizeSlider);

    // create grid button
    const buttonsPanel = document.createElement("div");
    buttonsPanel.className = "buttons-panel";
    app.form.appendChild(buttonsPanel);
    const createButton = app.createButton("⌗");
    createButton.addEventListener("click", app.updateBoard);
    buttonsPanel.appendChild(createButton);

    // export button
    const exportButton = document.createElement("button");
    exportButton.textContent = "🗐";
    exportButton.className = "input-button export-button";
    exportButton.addEventListener("click", app.exportCanvas);
    buttonsPanel.appendChild(exportButton);

    // undo button
    const undoButton = document.createElement("button");
    undoButton.textContent = "↶";
    undoButton.className = "input-button undo-button";
    undoButton.addEventListener("click", app.undo);
    buttonsPanel.appendChild(undoButton);

    // redo button
    const redoButton = document.createElement("button");
    redoButton.textContent = "↷";
    redoButton.className = "input-button redo-button";
    redoButton.addEventListener("click", app.redo);
    buttonsPanel.appendChild(redoButton);

    gridSizeSlider
      .querySelector("input")
      .addEventListener("input", app.updateSliderValueDisplay);
    pixelSizeSlider
      .querySelector("input")
      .addEventListener("input", app.updateSliderValueDisplay);
  },
  updateBoard: function (event) {
    event.preventDefault();
    const gridSizeSlider = document.getElementById("grid-size-slider");
    const pixelSizeSlider = document.getElementById("pixel-size-slider");
    app.gridSize = parseInt(gridSizeSlider.value, 10);
    app.pixelSize = parseInt(pixelSizeSlider.value, 10);
    app.drawBoard();
  },
  updateSliderValueDisplay: function (event) {
    const sliderContainer = event.target.closest(".slider-container");
    const valueSpan = sliderContainer.querySelector("span");
    valueSpan.textContent = event.target.value;
  },
  drawPalette: function () {
    let palette = document.createElement("div");
    palette.className = "palette";
    app.styles.forEach(function (style) {
      let anchor = document.createElement("a");
      anchor.classList.add("palette-color", "palette--" + style);
      anchor.dataset.style = style;
      if (style == app.activeColor) {
        anchor.classList.add("active-color");
      }
      anchor.addEventListener("click", app.handleChangeCurrentColor);
      palette.appendChild(anchor);
    });
    document.body.appendChild(palette);
  },
  handleChangeCurrentColor: function (event) {
    const oldColor = document.querySelector(".active-color");
    oldColor.classList.remove("active-color");
    let newColor = event.target;
    newColor.classList.add("active-color");
    app.activeColor = event.target.dataset.style;
  },
  saveState: function () {
    // Slice off any 'future' states if we've undone something
    app.history = app.history.slice(0, app.historyIndex + 1);

    // Push this new board state
    const currentBoardHTML = app.board.innerHTML;
    app.history.push(currentBoardHTML);

    // Increment pointer to the latest state
    app.historyIndex++;

    // Also store the current board HTML in localStorage
    localStorage.setItem("pixelpainter-board", currentBoardHTML);
  },
  undo: function (event) {
    if (event) event.preventDefault(); // Prevent page refresh on button click
    console.log("Undo clicked");
    // If there's a previous state, move pointer back and restore
    if (app.historyIndex > 0) {
      app.historyIndex--;
      app.board.innerHTML = app.history[app.historyIndex];
      app.enableDrawing();
    }
  },
  redo: function (event) {
    if (event) event.preventDefault(); // Prevent page refresh on button click

    // If there's a next state, move pointer forward and restore
    if (app.historyIndex < app.history.length - 1) {
      app.historyIndex++;
      app.board.innerHTML = app.history[app.historyIndex];
      app.enableDrawing();
    }
  },
  exportCanvas: function (event) {
    event.preventDefault();
    const ctx = app.exportCanvasElement.getContext("2d");
    app.exportCanvasElement.width = app.gridSize * app.pixelSize;
    app.exportCanvasElement.height = app.gridSize * app.pixelSize;
    ctx.clearRect(
      0,
      0,
      app.exportCanvasElement.width,
      app.exportCanvasElement.height
    );

    const pixels = document.querySelectorAll(".pixel");
    // ctx.lineWidth = 0.1;
    // ctx.strokeStyle = "black";
    // ctx.imageSmoothingEnabled = false;
    pixels.forEach((pixel, index) => {
      const col = index % app.gridSize;
      const row = Math.floor(index / app.gridSize);
      const color = window.getComputedStyle(pixel).backgroundColor;
      ctx.fillStyle = color;
      ctx.fillRect(
        col * app.pixelSize,
        row * app.pixelSize,
        app.pixelSize,
        app.pixelSize
      );
      ctx.strokeRect(
        col * app.pixelSize,
        row * app.pixelSize,
        app.pixelSize,
        app.pixelSize
      );
    });

    const link = document.createElement("a");
    link.download = "pixelpainter.jpg";
    link.href = app.exportCanvasElement.toDataURL("image/jpeg");
    link.click();
  },
};

app.init();
