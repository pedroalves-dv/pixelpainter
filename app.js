document.addEventListener("DOMContentLoaded", function () {
  const app = {
    // gridSize: 20,
    gridWidth: 20,
    gridHeight: 20,
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
      "color56",
      "color57",
      "color58",
      "color59",
      "color60",
      "color61",
      "color62",
      "color63",
      "color64",
      "color65",
      "color66",
      "color67",
      "color68",
      "color69",
      "color70",
      "color71",
      "color72",
      "color73",
      "color74",
      "color75",
      "color76",
      "color77",
      "color78",
      "color79",
      "color80",
      "color81",
      "color82",
      "color83",
      "color84",
      "color85",
      "color86",
      "color87",
      "color88",
      "color89",
      "color90",
      "color91",
      "color92",
      "color93",
      "color94",
      "color95",
    ],

    init: function () {
      app.drawBoard();
      app.saveState();
      app.drawFormWithSlidersAndButtons();
      app.drawPalette();
      app.drawNav();
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
      for (let i = 0; i < app.gridHeight; i++) {
        let ligne = document.createElement("div");
        ligne.className = "ligne";
        for (let j = 0; j < app.gridWidth; j++) {
          let pixel = document.createElement("div");
          pixel.classList.add("pixel", "border");
          pixel.style.width = app.pixelSize + "px";
          pixel.style.height = app.pixelSize + "px";
          ligne.appendChild(pixel);
        }
        app.board.appendChild(ligne);
      }
      app.enableDrawing();
    },

    handlePixelClick: function (event) {
      const element = event.target;
      if (!element.classList.contains("pixel")) return;
      app.paintPixel(element);
    },

    // Paint a single pixel element with the current active color
    paintPixel: function (element) {
      if (!element || !element.classList || !element.classList.contains("pixel")) return;
      // Remove all palette--* classes
      app.styles.forEach((style) => {
        element.classList.remove("palette--" + style);
      });
      element.classList.add("palette--" + app.activeColor);
    },

    // --- Image upload & mapping helpers ---
    // Read computed palette colors and return array of { style, r,g,b }
    getPaletteRGBs: function () {
      const paletteElems = Array.from(document.querySelectorAll('.palette-color'));
      const colors = paletteElems.map((el) => {
        const style = el.dataset.style;
        const cs = window.getComputedStyle(el).backgroundColor;
        // parse rgb(a) string -> [r,g,b]
        const m = cs.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (m) return { style, r: +m[1], g: +m[2], b: +m[3] };
        return { style, r: 0, g: 0, b: 0 };
      });
      return colors;
    },

    // Given r,g,b find nearest palette style (euclidean distance)
    nearestPaletteColor: function (r, g, b, paletteRGBs) {
      let best = null;
      let bestDist = Infinity;
      for (const p of paletteRGBs) {
        const dr = p.r - r;
        const dg = p.g - g;
        const db = p.b - b;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bestDist) {
          bestDist = dist;
          best = p;
        }
      }
      return best ? best.style : app.styles[0];
    },

    // Handle a File object selected by the user
    handleImageUpload: function (file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async function (ev) {
        const img = new Image();
        img.onload = async function () {
          try {
            // create an offscreen canvas scaled to the current grid size
            const tmp = document.createElement('canvas');
            tmp.width = app.gridWidth;
            tmp.height = app.gridHeight;
            const ctx = tmp.getContext('2d');
            // draw the uploaded image scaled to fit the grid
            ctx.drawImage(img, 0, 0, tmp.width, tmp.height);
            // get ImageData
            const data = ctx.getImageData(0, 0, tmp.width, tmp.height).data;
            // map image data to palette and paint board
            app.mapImageToGrid(data, tmp.width, tmp.height);
          } catch (err) {
            console.error('Error processing image', err);
          }
        };
        img.onerror = function (err) {
          console.error('Image load error', err);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    },

    // Map image pixel data (Uint8ClampedArray) scaled to width,height to the board
    mapImageToGrid: function (data, width, height) {
      if (!data || data.length === 0) return;
      // compute palette rgb list
      const palette = app.getPaletteRGBs();

      // Save state for undo
      app.saveState();

      // iterate rows/cols and set pixel classes
      const pixels = Array.from(document.querySelectorAll('.pixel'));
      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          const idx = (row * width + col) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          // If transparent, skip painting
          if (a === 0) continue;
          const style = app.nearestPaletteColor(r, g, b, palette);
          const pixelIndex = row * app.gridWidth + col;
          const el = pixels[pixelIndex];
          if (el) {
            // temporarily set activeColor then paint
            const previousActive = app.activeColor;
            app.activeColor = style;
            app.paintPixel(el);
            app.activeColor = previousActive;
          }
        }
      }
      // Save post-change state
      app.saveState();
    },

    enableDrawing: function () {
      // Don't attach handlers more than once
      if (app._drawingHandlersAttached) return;
      app._drawingHandlersAttached = true;

      app._isDrawing = false;

      const board = app.board;

      function getPixelAtEvent(e) {
        // Use elementFromPoint to account for transforms and get the top-most pixel
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (el && el.classList && el.classList.contains("pixel")) return el;
        return null;
      }

      board.addEventListener("pointerdown", (e) => {
        // Only respond to primary button
        if (e.button !== 0) return;
        if (app.panning.isSpaceDown) return;
        const pixel = getPixelAtEvent(e);
        if (!pixel) return;
        e.preventDefault();
        // Mark drawing started and save pre-change state
        if (!app._isDrawing) {
          app._isDrawing = true;
          app.saveState();
        }
        app.paintPixel(pixel);
      });

      document.addEventListener("pointermove", (e) => {
        if (!app._isDrawing) return;
        const pixel = getPixelAtEvent(e);
        if (pixel) {
          app.paintPixel(pixel);
        }
      });

      document.addEventListener("pointerup", (e) => {
        if (!app._isDrawing) return;
        // finalize and save
        app._isDrawing = false;
        app.saveState();
      });

      // pointercancel/touchcancel handling
      document.addEventListener("pointercancel", () => {
        if (app._isDrawing) {
          app._isDrawing = false;
          app.saveState();
        }
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
      // Grid size sliders
      const gridWidthSlider = app.createSlider(
        "grid-width-slider",
        "Grid (width)",
        1,
        70,
        app.gridWidth,
        1
      );
      slidersContainer.appendChild(gridWidthSlider);
    
      const gridHeightSlider = app.createSlider(
        "grid-height-slider",
        "Grid (height)",
        1,
        70,
        app.gridHeight,
        1
      );
      slidersContainer.appendChild(gridHeightSlider);
      // Pixel size slider
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

      const applyPreset = (gridHeight, gridWidth, pixelSize) => {
        app.gridHeight = gridHeight;
        app.gridWidth = gridWidth;
        app.pixelSize = pixelSize;

        // Update slider input and display values using querySelector
        gridHeightSlider.querySelector("input").value = gridHeight;
        gridWidthSlider.querySelector("input").value = gridWidth;
        pixelSizeSlider.querySelector("input").value = pixelSize;
        gridHeightSlider.querySelector("span").textContent = gridHeight;
        gridWidthSlider.querySelector("span").textContent = gridWidth;
        pixelSizeSlider.querySelector("span").textContent = pixelSize;

        app.drawBoard();
      };

      presetsContainer
        .appendChild(app.createButton("Preset 1", () => applyPreset(11, 11, 60)))
        .classList.add("preset-button");
      presetsContainer
        .appendChild(app.createButton("Preset 2", () => applyPreset(20, 20, 30)))
        .classList.add("preset-button");
      presetsContainer
        .appendChild(app.createButton("Preset 3", () => applyPreset(30, 30, 20)))
        .classList.add("preset-button");
      presetsContainer
        .appendChild(app.createButton("Preset 4", () => applyPreset(45, 45, 15)))
        .classList.add("preset-button");
        presetsContainer
        .appendChild(app.createButton("Preset 5", () => applyPreset(20, 30, 30)))
        .classList.add("preset-button");
        presetsContainer
        .appendChild(app.createButton("Preset 6", () => applyPreset(25, 20, 25)))
        .classList.add("preset-button");
        presetsContainer
        .appendChild(app.createButton("Preset 7", () => applyPreset(10, 30, 40)))
        .classList.add("preset-button");
        presetsContainer
        .appendChild(app.createButton("Preset 8", () => applyPreset(5, 24, 60)))
        .classList.add("preset-button");
        presetsContainer
        .appendChild(app.createButton("Preset 9", () => applyPreset(12, 26, 60)))
        .classList.add("preset-button");
        presetsContainer
        .appendChild(app.createButton("Preset 10", () => applyPreset(8, 6, 100)))
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

      // image upload (client-side) - button + hidden file input
      const uploadButton = document.createElement("button");
      uploadButton.textContent = "✦"; // upload icon-like glyph
      uploadButton.className = "input-button upload-button";
      uploadButton.setAttribute("data-tooltip", "Upload Image");
      buttonsPanel.appendChild(uploadButton);

      const uploadInput = document.createElement("input");
      uploadInput.type = "file";
      uploadInput.accept = "image/*";
      uploadInput.style.display = "none";
      // handle files
      uploadInput.addEventListener("change", (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (file) {
          app.handleImageUpload(file);
        }
        // reset input so the same file can be picked again
        uploadInput.value = "";
      });
      // click file picker when button pressed
      uploadButton.addEventListener("click", (e) => {
        e.preventDefault();
        uploadInput.click();
      });
      // append the hidden input to the form so it's in DOM
      app.form.appendChild(uploadInput);

      // eyedropper button (pick color from a pixel)
      const eyedropperButton = document.createElement("button");
      eyedropperButton.textContent = "🖌"; // eyedropper-like glyph
      eyedropperButton.className = "input-button eyedropper-button";
      eyedropperButton.setAttribute("data-tooltip", "Eyedropper");
      buttonsPanel.appendChild(eyedropperButton);

      // Toggle eyedropper active state on click
      eyedropperButton.addEventListener("click", (e) => {
        e.preventDefault();
        app._eyedropperActive = !app._eyedropperActive;
        if (app._eyedropperActive) {
          eyedropperButton.classList.add("active");
          app.board.style.cursor = "copy";
        } else {
          eyedropperButton.classList.remove("active");
          app.board.style.cursor = "crosshair";
        }
      });

      // Capture pointerdown early so we can pick color before paint handlers run
      document.addEventListener(
        "pointerdown",
        function (ev) {
          if (!app._eyedropperActive) return;
          // find the topmost element at pointer
          const el = document.elementFromPoint(ev.clientX, ev.clientY);
          if (!el || !el.classList || !el.classList.contains("pixel")) return;

          // find a palette--class on the pixel; if none, default to white ('color5')
          const cls = Array.from(el.classList).find((c) => c.startsWith("palette--"));
          let style = null;
          if (cls) {
            style = cls.replace("palette--", "");
          } else {
            style = 'color5'; // white as default for blank pixels
          }

          // update palette UI active color
          const old = document.querySelector(".active-color");
          if (old) old.classList.remove("active-color");
          const newEl = document.querySelector(`.palette-color[data-style="${style}"]`);
          if (newEl) newEl.classList.add("active-color");
          app.activeColor = style;

          // deactivate eyedropper and restore cursor/button state
          app._eyedropperActive = false;
          eyedropperButton.classList.remove("active");
          app.board.style.cursor = "crosshair";

          // Prevent further handlers (like drawing) from handling this event
          ev.preventDefault();
          ev.stopImmediatePropagation();
        },
        true // useCapture true so we run before other listeners
      );

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

      gridHeightSlider
        .querySelector("input")
        .addEventListener("input", app.updateSliderValueDisplay);
        gridWidthSlider
        .querySelector("input")
        .addEventListener("input", app.updateSliderValueDisplay);
      pixelSizeSlider
        .querySelector("input")
        .addEventListener("input", app.updateSliderValueDisplay);

        const paletteLabel = document.createElement("div");
        paletteLabel.className = "palette-label";
        paletteLabel.textContent = "Colors";
        app.form.appendChild(paletteLabel);
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

        // Try to parse translate(xpx, ypx) allowing decimals; fallback to existing offsets
        const m = app.board.style.transform.match(/translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)/);
        if (m) {
          app.panning.offsetX = parseFloat(m[1]);
          app.panning.offsetY = parseFloat(m[2]);
        }

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
      const gridWidthSlider = document.getElementById("grid-width-slider");
      const gridHeightSlider = document.getElementById("grid-height-slider");
      const pixelSizeSlider = document.getElementById("pixel-size-slider");

      // Get the dimensions of the wrapper
      const wrapper = document.querySelector(".wrapper");
      const wrapperWidth = wrapper.clientWidth;
      const wrapperHeight = wrapper.clientHeight;

      // Calculate the maximum grid size and pixel size that can fit within the wrapper
      const maxGridHeight = Math.min(
        parseInt(gridHeightSlider.value, 10),
        Math.floor(wrapperWidth / app.pixelSize),
        Math.floor(wrapperHeight / app.pixelSize)
      );
      const maxGridWidth = Math.min(
        parseInt(gridWidthSlider.value, 10),
        Math.floor(wrapperWidth / app.pixelSize),
        Math.floor(wrapperHeight / app.pixelSize)
      );
      const maxPixelSize = Math.min(
        parseInt(pixelSizeSlider.value, 10),
        Math.floor(wrapperWidth / app.gridWidth),
        Math.floor(wrapperHeight / app.gridHeight)
      );

      // Update the grid size and pixel size based on the calculated maximum values
      app.gridHeight = maxGridHeight;
      app.gridWidth = maxGridWidth;
      app.pixelSize = maxPixelSize;

      // Update the slider values to reflect the new grid size and pixel size
      gridHeightSlider.value = app.gridHeight;
      gridWidthSlider.value = app.gridWidth;
      pixelSizeSlider.value = app.pixelSize;

      // Update the displayed values in the spans
      const gridHeightSpan = gridHeightSlider.parentElement.querySelector("span");
      const gridWidthSpan = gridWidthSlider.parentElement.querySelector("span");
      const pixelSizeSpan = pixelSizeSlider.parentElement.querySelector("span");
      if (gridHeightSpan) {
        gridHeightSpan.textContent = app.gridHeight;
      }
      if (gridWidthSpan) {
        gridWidthSpan.textContent = app.gridWidth;
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
      if (oldColor) oldColor.classList.remove("active-color");
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

      // Correct canvas dimensions: width = gridWidth * pixelSize, height = gridHeight * pixelSize
      const canvasWidth = app.gridWidth * app.pixelSize;
      const canvasHeight = app.gridHeight * app.pixelSize;
      app.exportCanvasElement.width = canvasWidth;
      app.exportCanvasElement.height = canvasHeight;

      ctx.imageSmoothingEnabled = false;

      // For JPEG exports, paint a white background; for PNG keep transparency
      const isJpeg = format === "jpeg" || format === "jpg";
      if (isJpeg) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      } else {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      }

      const pixels = Array.from(document.querySelectorAll(".pixel"));
      // draw each logical pixel into the canvas using consistent indexing (gridWidth)
      pixels.forEach((pixel, index) => {
        const col = index % app.gridWidth;
        const row = Math.floor(index / app.gridWidth);
        const color = window.getComputedStyle(pixel).backgroundColor;

        // If pixel is painted, draw its color
        const isTransparent =
          !color ||
          color === "transparent" ||
          color === "rgba(0, 0, 0, 0)";

        if (!isTransparent) {
          ctx.fillStyle = color;
          ctx.fillRect(
            col * app.pixelSize,
            row * app.pixelSize,
            app.pixelSize,
            app.pixelSize
          );
        }
      });

      // Draw grid lines in a single pass for crisp 1px lines
      if (app.borderVisible) {
        ctx.beginPath();
        ctx.strokeStyle = "#171717";
        ctx.lineWidth = 1;

        // vertical lines
        for (let x = 0; x <= app.gridWidth; x++) {
          const px = x * app.pixelSize + 0.5; // 0.5 for crisp 1px lines on canvas
          ctx.moveTo(px, 0);
          ctx.lineTo(px, canvasHeight);
        }

        // horizontal lines
        for (let y = 0; y <= app.gridHeight; y++) {
          const py = y * app.pixelSize + 0.5;
          ctx.moveTo(0, py);
          ctx.lineTo(canvasWidth, py);
        }

        ctx.stroke();
      }

      const link = document.createElement("a");
      const ext = isJpeg ? "jpg" : "png";
      link.download = `pixelpainter.${ext}`;
      const mime = isJpeg ? "image/jpeg" : "image/png";
      link.href = app.exportCanvasElement.toDataURL(mime);
      link.click();
    },
  };

  app.init();
});
