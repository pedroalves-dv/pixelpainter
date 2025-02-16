document.addEventListener("DOMContentLoaded", function () {
  const app = {
    gridSize: 20,
    pixelSize: 30,
    activeColor: "color1",
    board: document.getElementById("invader"),
    exportCanvasElement: document.getElementById("export-canvas"),
    nav: document.querySelector(".navigation"),
    tools: document.querySelector(".tools"),
    form: document.querySelector(".configuration"),
    header: document.querySelector(".header"),
    palette: document.querySelector(".palette"),
    wrapper: document.querySelector(".wrapper"),

    panning: {
      isSpaceDown: false,
      isDragging: false,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
    },
    borderVisible: true,
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
      "color17",
      "color18",
      "color19",
      "color20",
      "color21",
      "color22",
      "color23",
      "color24",
      "color25",
      "color26",
      "color27",
      "color28",
      "color29",
      "color30",
      "color31",
      "color32",
      "color33",
      "color34",
      "color35",
      "color36",
      "color37",
      "color38",
      "color39",
      "color40",
      "color41",
      "color42",
      "color43",
      "color44",
      "color45",
      "color46",
      "color47",
      "color48",
      "color49",
      "color50",
      "color51",
      "color52",
      "color53",
      "color54",
      "color55",
    ],
    init: function () {
      // // If there's a saved board state in localStorage, load it
      // const savedState = localStorage.getItem("pixelpainter-board");
      // if (savedState) {
      //   app.board.innerHTML = savedState;
      // } else {
      //   // Otherwise, create a blank board
      //   app.drawBoard();
      // }

      app.drawBoard();
      // app.saveState();
      // app.history.push(app.board.innerHTML);
      // app.historyIndex = 0;
      // app.history = [];
      // app.historyIndex = -1;
      app.saveState(); // Save initial empty board once

      app.drawFormWithSlidersAndButtons();
      app.drawPalette();
      app.drawNav();
      app.enableDrawing();
      app.enablePanning();
    },
    createButton: function (textTitre, callback) {
      let button = document.createElement("button");
      button.textContent = textTitre;
      button.type = "button";
      if (typeof callback === "function") {
        button.addEventListener("click", callback);
      }
      return button;
    },
    drawBoard: function () {
      app.board.innerHTML = "";
      for (let i = 0; i < app.gridSize; i++) {
        let ligne = document.createElement("div");
        ligne.className = "ligne";
        for (let j = 0; j < app.gridSize; j++) {
          let pixel = document.createElement("div");
          pixel.classList.add("pixel", "border");
          pixel.style.width = app.pixelSize + "px";
          pixel.style.height = app.pixelSize + "px";
          ligne.appendChild(pixel);
        }
        app.board.appendChild(ligne);
      }
      app.enableDrawing();

      // Only save an initial empty state if history is empty
      // if (app.history.length === 0) {
      //   app.saveState();
      // }
    },
    handlePixelClick: function (event) {
      const element = event.target;
      if (!element.classList.contains("pixel")) {
        // app.saveState();
        return;
      }

      // If it's the first user action, store the initial state before modifying anything
      if (app.historyIndex === 0) {
        app.saveState(); // Ensure first change is undoable
      }

      // Remove all palette--* classes
      app.styles.forEach((style) => {
        element.classList.remove("palette--" + style);
      });
      // Add the currently active color
      element.classList.add("palette--" + app.activeColor);

      // After each valid pixel click, save the state

      console.log(app.history, this.historyIndex);
      // app.saveState();
    },

    enableDrawing: function () {
      let isDrawing = false;
      const pixels = document.querySelectorAll(".pixel");

      pixels.forEach((pixel) => {
        // Press down to start drawing
        pixel.addEventListener("mousedown", (event) => {
          if (app.panning.isSpaceDown) return;     
          event.preventDefault();
          isDrawing = true;

          // Ensure the initial state is stored before the first stroke
          if (app.historyIndex === 0) {
            app.saveState();
          }
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
      sliderLabel.appendChild(valueSpan);
      sliderContainer.appendChild(slider);

      return sliderContainer;
    },
    clearBoard: function () {
      app.board.innerHTML = "";
      app.drawBoard();
    },
    togglePixelBorder: function () {
      app.borderVisible = !app.borderVisible;
      const pixels = document.querySelectorAll(".pixel");
      pixels.forEach((pixel) => {
        if (app.borderVisible) {
          pixel.classList.add("border");
        } else {
          pixel.classList.remove("border");
        }
      });
      const toggleBorderButton = document.querySelector(
        ".toggle-border-button"
      );
      if (app.borderVisible) {
        toggleBorderButton.textContent = "𖣯";
        toggleBorderButton.classList.remove("no-grid");
        toggleBorderButton.classList.add("grid");
      } else {
        toggleBorderButton.textContent = "⊞";
        toggleBorderButton.classList.remove("grid");
        toggleBorderButton.classList.add("no-grid");
      }
    },
    drawFormWithSlidersAndButtons: function () {
      app.form.innerHTML = "";
      // Sliders Label
      const slidersLabel = document.createElement("div");
      slidersLabel.className = "sliders-label";
      slidersLabel.textContent = "Custom";
      app.form.appendChild(slidersLabel);

      // Sliders container
      const slidersContainer = document.createElement("div");
      slidersContainer.className = "sliders-container";
      app.form.appendChild(slidersContainer);

      // Sliders
      const gridSizeSlider = app.createSlider(
        "grid-size-slider",
        "Grid (lenght)",
        1,
        70,
        app.gridSize,
        1
      );
      slidersContainer.appendChild(gridSizeSlider);

      const pixelSizeSlider = app.createSlider(
        "pixel-size-slider",
        "Pixel (px)",
        10,
        100,
        app.pixelSize,
        10
      );
      slidersContainer.appendChild(pixelSizeSlider);

      // Apply button
      const applyButton = app.createButton("Apply");
      applyButton.className = "input-button apply-button";
      applyButton.addEventListener("click", app.updateBoard);
      slidersContainer.appendChild(applyButton);

      // Presets Label
      const PresetsLabel = document.createElement("div");
      PresetsLabel.className = "presets-label";
      PresetsLabel.textContent = "Presets";
      app.form.appendChild(PresetsLabel);

      // Preset buttons container
      const presetsContainer = document.createElement("div");
      presetsContainer.className = "presets-container";

      const applyPreset = (gridSize, pixelSize) => {
        app.gridSize = gridSize;
        app.pixelSize = pixelSize;

        // Update slider input and display values using querySelector
        gridSizeSlider.querySelector("input").value = gridSize;
        pixelSizeSlider.querySelector("input").value = pixelSize;
        gridSizeSlider.querySelector("span").textContent = gridSize;
        pixelSizeSlider.querySelector("span").textContent = pixelSize;

        app.drawBoard();
      };

      presetsContainer
        .appendChild(app.createButton("Preset 1", () => applyPreset(11, 60)))
        .classList.add("preset-button");
      presetsContainer
        .appendChild(app.createButton("Preset 2", () => applyPreset(20, 30)))
        .classList.add("preset-button");
      presetsContainer
        .appendChild(app.createButton("Preset 3", () => applyPreset(30, 20)))
        .classList.add("preset-button");
      presetsContainer
        .appendChild(app.createButton("Preset 4", () => applyPreset(45, 15)))
        .classList.add("preset-button");

      // Append presets container to form
      app.form.appendChild(presetsContainer);

      // Buttons panel
      const buttonsPanel = document.querySelector(".buttons-panel");
      app.header.appendChild(buttonsPanel);

      // undo button
      const undoButton = document.createElement("button");
      undoButton.textContent = "↶";
      undoButton.className = "input-button undo-button";
      undoButton.setAttribute("data-tooltip", "Undo");
      undoButton.addEventListener("click", app.undo);
      buttonsPanel.appendChild(undoButton);

      // redo button
      const redoButton = document.createElement("button");
      redoButton.textContent = "↷";
      redoButton.className = "input-button redo-button";
      redoButton.setAttribute("data-tooltip", "Redo");
      redoButton.addEventListener("click", app.redo);
      buttonsPanel.appendChild(redoButton);

      // clear board button
      const clearButton = document.createElement("button");
      clearButton.textContent = "↻";
      clearButton.className = "input-button clear-button";
      clearButton.setAttribute("data-tooltip", "Clear");
      clearButton.addEventListener("click", app.clearBoard);
      buttonsPanel.appendChild(clearButton);

      // toggle border button
      const toggleBorderButton = document.createElement("button");
      toggleBorderButton.textContent = "𖣯";
      toggleBorderButton.className = "input-button toggle-border-button grid";
      toggleBorderButton.setAttribute("data-tooltip", "Toggle Grid");
      toggleBorderButton.addEventListener("click", app.togglePixelBorder);
      buttonsPanel.appendChild(toggleBorderButton);

      // zoom buttons
      const zoomInButton = document.createElement("button");
      zoomInButton.type = "button";
      zoomInButton.className = "input-button zoom-button";
      zoomInButton.innerHTML = `<img src="assets/zoom-in.png" alt="Zoom In">`;
      zoomInButton.setAttribute("data-tooltip", "Zoom In");
      zoomInButton.addEventListener("click", app.zoomIn);

      const zoomOutButton = document.createElement("button");
      zoomOutButton.type = "button";
      zoomOutButton.className = "input-button zoom-button";
      zoomOutButton.innerHTML = `<img src="assets/zoom-out.png" alt="Zoom Out">`;
      zoomOutButton.setAttribute("data-tooltip", "Zoom Out");
      zoomOutButton.addEventListener("click", app.zoomOut);

      buttonsPanel.appendChild(zoomInButton);
      buttonsPanel.appendChild(zoomOutButton);

      // reset pan button
      const resetPanButton = document.createElement("button");
      resetPanButton.type = "button";
      resetPanButton.className = "input-button reset-pan-button";
      resetPanButton.setAttribute("data-tooltip", "Reset Position");
      resetPanButton.textContent = "⌗";
      resetPanButton.addEventListener("click", app.resetPan);
      buttonsPanel.appendChild(resetPanButton);

      // export dropdown
      const exportDropdown = document.createElement("div");
      exportDropdown.className = "dropdown";

      const dropdownContent = document.createElement("div");
      dropdownContent.className = "dropdown-content";

      // export button
      const exportButton = document.createElement("button");
      exportButton.textContent = "🗎";
      exportButton.className = "input-button export-button";
      exportButton.setAttribute("data-tooltip", "Export");
      exportButton.addEventListener("click", (event) => {
        event.preventDefault();
        dropdownContent.classList.toggle("show");
      });
      buttonsPanel.appendChild(exportButton);

      const exportJPG = document.createElement("a");
      exportJPG.href = "#";
      exportJPG.textContent = "Export as JPG";
      exportJPG.addEventListener("click", (event) =>
        app.exportCanvas(event, "jpeg")
      );
      dropdownContent.appendChild(exportJPG);

      const exportPNG = document.createElement("a");
      exportPNG.href = "#";
      exportPNG.textContent = "Export as PNG";
      exportPNG.addEventListener("click", (event) =>
        app.exportCanvas(event, "png")
      );
      dropdownContent.appendChild(exportPNG);

      exportDropdown.appendChild(dropdownContent);
      buttonsPanel.appendChild(exportDropdown);

      document.addEventListener("click", (event) => {
        const clickedInsideDropdown =
          exportDropdown.contains(event.target) ||
          exportButton.contains(event.target);
        if (
          !clickedInsideDropdown &&
          dropdownContent.classList.contains("show")
        ) {
          dropdownContent.classList.remove("show");
        }
      });

      gridSizeSlider
        .querySelector("input")
        .addEventListener("input", app.updateSliderValueDisplay);
      pixelSizeSlider
        .querySelector("input")
        .addEventListener("input", app.updateSliderValueDisplay);
    },
    // zoom functions
    zoomLevel: 1,
    applyZoom: function () {
      // Combine pan and zoom: pan is applied via translate and then scale
      app.board.style.transform = `translate(${app.panning.offsetX}px, ${app.panning.offsetY}px) scale(${app.zoomLevel})`;
      app.board.style.transformOrigin = "center center";
    },
    zoomIn: function () {
      app.zoomLevel *= 1.25;
      app.applyZoom();
    },
    zoomOut: function () {
      app.zoomLevel /= 1.25;
      app.applyZoom();
    },

    enablePanning: function () {
      const wrapper = document.querySelector(".wrapper");
      // const board = app.board;
      // Listen for spacebar keydown/up
      document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
          app.panning.isSpaceDown = true;
          wrapper.style.cursor = "grab";
          app.board.style.cursor = "grab";
          e.preventDefault();
        }
      });
      document.addEventListener("keyup", (e) => {
        if (e.code === "Space") {
          app.panning.isSpaceDown = false;
          wrapper.style.cursor = "default";
          app.board.style.cursor = "crosshair";
          app.panning.isDragging = false;
        }
      });
      // When spacebar is held, allow dragging of the #invader board
      app.board.addEventListener("mousedown", (e) => {
        if (!app.panning.isSpaceDown) return;
        app.panning.isDragging = true;
        app.panning.startX = e.clientX;
        app.panning.startY = e.clientY;
        app.board.style.cursor = "grabbing";
        // Calculate boundaries ONCE at the start of dragging
    if (app.zoomLevel <= 1) {
      const wrapperRect = wrapper.getBoundingClientRect();
      const boardRect = app.board.getBoundingClientRect();

      app.panning.minX = wrapperRect.left - boardRect.left + app.panning.offsetX;
      app.panning.maxX = wrapperRect.right - boardRect.right + app.panning.offsetX;
      app.panning.minY = wrapperRect.top - boardRect.top + app.panning.offsetY;
      app.panning.maxY = wrapperRect.bottom - boardRect.bottom + app.panning.offsetY;
    }

    e.preventDefault();
      });
      document.addEventListener("mousemove", (e) => {
        if (!app.panning.isDragging) return;
    
        const dx = e.clientX - app.panning.startX;
        const dy = e.clientY - app.panning.startY;
    
        let newX = app.panning.offsetX + dx;
        let newY = app.panning.offsetY + dy;
    
        // Restrict movement only when zoom level is 1 or less
        if (app.zoomLevel <= 1) {
          newX = Math.min(Math.max(newX, app.panning.minX), app.panning.maxX);
          newY = Math.min(Math.max(newY, app.panning.minY), app.panning.maxY);
        }
        
    
        app.board.style.transform = `translate(${newX}px, ${newY}px) scale(${app.zoomLevel})`;
        e.preventDefault();
      });
    
      document.addEventListener("mouseup", (e) => {
        if (!app.panning.isDragging) return;
    
        app.panning.offsetX = parseFloat(app.board.style.transform.match(/translate\((-?\d+)px, (-?\d+)px\)/)[1]);
    app.panning.offsetY = parseFloat(app.board.style.transform.match(/translate\((-?\d+)px, (-?\d+)px\)/)[2]);

    app.panning.isDragging = false;
    app.applyZoom();
      });
    },

    resetPan: function () {
      app.panning.offsetX = 0;
      app.panning.offsetY = 0;
      app.zoomLevel = 1;
      app.applyZoom();
    },

    updateBoard: function (event) {
      event.preventDefault();
      const gridSizeSlider = document.getElementById("grid-size-slider");
      const pixelSizeSlider = document.getElementById("pixel-size-slider");

      // Get the dimensions of the wrapper
      const wrapper = document.querySelector(".wrapper");
      const wrapperWidth = wrapper.clientWidth;
      const wrapperHeight = wrapper.clientHeight;

      // Calculate the maximum grid size and pixel size that can fit within the wrapper
      const maxGridSize = Math.min(
        parseInt(gridSizeSlider.value, 10),
        Math.floor(wrapperWidth / app.pixelSize),
        Math.floor(wrapperHeight / app.pixelSize)
      );
      const maxPixelSize = Math.min(
        parseInt(pixelSizeSlider.value, 10),
        Math.floor(wrapperWidth / app.gridSize),
        Math.floor(wrapperHeight / app.gridSize)
      );

      // Update the grid size and pixel size based on the calculated maximum values
      app.gridSize = maxGridSize;
      app.pixelSize = maxPixelSize;

      // Update the slider values to reflect the new grid size and pixel size
      gridSizeSlider.value = app.gridSize;
      pixelSizeSlider.value = app.pixelSize;

      // Update the displayed values in the spans
      const gridSizeSpan = gridSizeSlider.parentElement.querySelector("span");
      const pixelSizeSpan = pixelSizeSlider.parentElement.querySelector("span");
      if (gridSizeSpan) {
        gridSizeSpan.textContent = app.gridSize;
      }
      if (pixelSizeSpan) {
        pixelSizeSpan.textContent = app.pixelSize;
      }
      app.drawBoard();
    },
    updateSliderValueDisplay: function (event) {
      const sliderContainer = event.target.closest(".slider-container");
      const valueSpan = sliderContainer.querySelector("span");
      valueSpan.textContent = event.target.value;
    },
    drawPalette: function () {
      // let palette = document.createElement("div");
      // palette.className = "palette";
      app.styles.forEach(function (style) {
        let anchor = document.createElement("a");
        anchor.classList.add("palette-color", "palette--" + style);
        anchor.dataset.style = style;
        if (style == app.activeColor) {
          anchor.classList.add("active-color");
        }
        anchor.addEventListener("click", app.handleChangeCurrentColor);
        app.palette.appendChild(anchor);
      });
    },
    drawNav: function () {
      app.nav.innerHTML = "";
      app.nav.appendChild(app.header);
    },
    drawTools: function () {
      app.tools.appendChild(app.form);
      app.tools.appendChild(app.palette);
    },
    handleChangeCurrentColor: function (event) {
      const oldColor = document.querySelector(".active-color");
      oldColor.classList.remove("active-color");
      let newColor = event.target;
      newColor.classList.add("active-color");
      app.activeColor = event.target.dataset.style;
    },
    saveState: function () {
      // Prevent saving duplicate states
      const currentBoardHTML = app.board.innerHTML;
      if (
        app.history.length > 0 &&
        app.history[app.historyIndex] === currentBoardHTML
      ) {
        return; // Avoid redundant saves
      }

      // Remove redo history if any
      app.history = app.history.slice(0, app.historyIndex + 1);

      // Save new state
      app.history.push(currentBoardHTML);
      app.historyIndex++;
    },
    undo: function (event) {
      if (event) event.preventDefault(); // Prevent page refresh on button click
      console.log("Undo clicked");
      // If there's a previous state, move pointer back and restore
      if (app.historyIndex > 0) {
        app.historyIndex--;
        app.board.innerHTML = app.history[app.historyIndex];
        app.enableDrawing();
        console.log("index is greater than 0");
        // } else if (app.historyIndex === app.historyIndex + 1) {
        // If we're at the first state, clear the board
        // app.historyIndex = 0;
        // app.historyIndex = app.historyIndex - 2;
        // app.board.innerHTML = app.history[app.historyIndex];
        //   console.log("index is 0");
        //   app.drawBoard();
      } else if (app.historyIndex === 0) {
        // app.history = [];
        // app.historyIndex = -1;
        // app.drawBoard();
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

    exportCanvas: function (event, format) {
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
      ctx.imageSmoothingEnabled = false;

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
        if (app.borderVisible) {
          ctx.strokeRect(
            col * app.pixelSize,
            row * app.pixelSize,
            app.pixelSize,
            app.pixelSize
          );
        }
      });

      const link = document.createElement("a");
      link.download = `pixelpainter.${format}`;
      link.href = app.exportCanvasElement.toDataURL(`image/${format}`);
      link.click();
    },
  };

  app.init();
});
