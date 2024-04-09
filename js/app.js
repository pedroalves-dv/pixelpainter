const app = {
  // Taille de la grille et des pixels
  gridSize: 8,
  pixelSize: 50,
  activeColor: "plain",

  // Element container pour notre grille de pixels
  board: document.getElementById("invader"),
  form: document.querySelector(".configuration"),

  // 4 styles possibles pour les couleurs
  styles: ["plain", "empty", "light", "highlight", "shadow"],

  /**
   * Cette fonction initialise le board et démarre l'application
   */
  init: function () {
    app.drawBoard();
    app.drawFormWithSliders();
    app.drawPalette();
  },

  // /**
  //    * Cette fonction permet de créer un <input type='text'> avec la possibilité
  //    * de définir un placeholder
  //    *
  //    * @param {string} placeholder  le texte d'aide a afficher dans l'inpur
  //    * @returns HTMLInputElement Le bouton crée
  //    */

  /**
   * Cette fonction permet de créer un bouton de type <button>
   *
   * @param {string} textTitre
   * @returns HTMLButtonElement
   */
  createButton: function (textTitre) {
    // Créer l'element
    let button = document.createElement("button");
    button.textContent = textTitre;
    button.className = "input-button";
    return button;
  },

  /**
   * Function pour créer le board avec les lignes et les pixels
   */
  drawBoard: function () {
    // Nettoyage du tableau
    app.board.innerHTML = "";
    // Boucle de génération des lignes

    for (let i = 0; i < app.gridSize; i++) {
      // Créer une <div> ligne, y ajouter les pixels
      let ligne = document.createElement("div");
      //ligne.classList.add('ligne')
      ligne.className = "ligne";

      for (let j = 0; j < app.gridSize; j++) {
        // Créer un pixel
        let pixel = document.createElement("div");
        // On met la classe pixel et couleur, puis largeur/hauteur
        pixel.classList.add("pixel");
        pixel.style.width = app.pixelSize + "px";
        pixel.style.height = app.pixelSize + "px";
        // Ajout du pixel dans la ligne
        ligne.appendChild(pixel);
      }
      // Ajout de la ligne créée avec ses pixels
      app.board.appendChild(ligne);
    }
    app.board.addEventListener("click", app.handlePixelClick);
  },

  /**
   * Cette fonction gère le click sur un pixel du container 'invader'
   *
   * @param {Event} event
   */
  handlePixelClick: function (event) {
    const element = event.target;
    app.styles.forEach(function (style) {
      element.classList.remove("palette--" + style);
    });
    element.classList.add("palette--" + app.activeColor);
  },

  /**
   * Fonction de création d'un formulaire avec les deux imput et le bouton
   */
  // drawFormulaire: function()
  // {
  //   // Ajout des elements du formulaire dans le container form
  //   // Création des deux input text
  //   const inputNbPixels = app.createInput('nb-pixels', 'Taille de la grille');
  //   app.form.appendChild(inputNbPixels);

  //   const inputSizPixels = app.createInput('size-pixels', 'Taille des pixels');
  //   app.form.appendChild(inputSizPixels);

  //   // Création du bouton valider
  //   const validation = app.createButton('Valider');
  //   app.form.appendChild(validation);

  //   // Ajout du handler sur le submit formulaire
  //   app.form.addEventListener('submit', app.handleValidationClick);
  // },

  /**
   * Function to create a slider with a label dynamically
   *
   * @param {string} id - The id for the slider
   * @param {string} label - The label for the slider
   * @param {number} min - Minimum value for the slider
   * @param {number} max - Maximum value for the slider
   * @param {number} value - Default value for the slider
   * @param {number} step - Step size for the slider
   * @returns {HTMLDivElement} - The created slider container
   */
  createSlider: function (id, label, min, max, value, step) {
    // Create a container div for the slider
    let sliderContainer = document.createElement("div");
    sliderContainer.className = "slider-container";

    // Create a label for the slider
    let sliderLabel = document.createElement("label");
    sliderLabel.textContent = label;

    // Create the input range slider
    let slider = document.createElement("input");
    slider.setAttribute("type", "range");
    slider.setAttribute("id", id);
    slider.setAttribute("min", min);
    slider.setAttribute("max", max);
    slider.setAttribute("value", value);
    slider.setAttribute("step", step);

    // Create a span to display the current value
    let valueSpan = document.createElement("span");
    valueSpan.textContent = value;

    // Append elements to the container
    sliderContainer.appendChild(sliderLabel);
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(valueSpan);

    // Return the slider container
    return sliderContainer;
  },

  /**
   * Function to create the form with sliders dynamically
   */
  drawFormWithSliders: function () {
    // Clear existing form content
    app.form.innerHTML = "";

    // Create grid size slider
    const gridSizeSlider = app.createSlider(
      "grid-size-slider",
      "Grid Size",
      1,
      20,
      app.gridSize,
      1
    );
    app.form.appendChild(gridSizeSlider);

    // Create pixel size slider
    const pixelSizeSlider = app.createSlider(
      "pixel-size-slider",
      "Pixel Size",
      10,
      100,
      app.pixelSize,
      10
    );
    app.form.appendChild(pixelSizeSlider);

    // Create validation button
    const validation = app.createButton("Create");
    app.form.appendChild(validation);

    // const reset = app.createButton('Clear');
    // app.form.appendChild(reset);

    // Add event listener to the validation button
    validation.addEventListener("click", app.updateBoard);

    // Add event listener to sliders for real-time value updates
    gridSizeSlider
      .querySelector("input")
      .addEventListener("input", app.updateSliderValueDisplay);
    pixelSizeSlider
      .querySelector("input")
      .addEventListener("input", app.updateSliderValueDisplay);
  },

  /**
   * Event handlers for the board
   */
  updateBoard: function (event) {
    event.preventDefault();
    // Get the new values from sliders
    const gridSizeSlider = document.getElementById("grid-size-slider");
    const pixelSizeSlider = document.getElementById("pixel-size-slider");

    // Update the app properties
    app.gridSize = parseInt(gridSizeSlider.value, 10);
    app.pixelSize = parseInt(pixelSizeSlider.value, 10);

    // Redraw the board with new parameters
    app.drawBoard();
  },

  updateSliderValueDisplay: function (event) {
    const sliderContainer = event.target.closest(".slider-container");
    const valueSpan = sliderContainer.querySelector("span");
    valueSpan.textContent = event.target.value;
  },

  // /**
  //  * Cette function sert à gérer la validation du formulaire
  //  *
  //  * @param {PointerEvent} event L'evt a l'orinine de l'appel à la fonction
  //  */
  // handleValidationClick: function(event)
  // {
  //   // Cette fonction empeche la remontée des evt vers les parents (event bubbling)
  //   event.preventDefault();

  //   // Récupération des deux champs texte
  //   let nbPixels = document.getElementById('nb-pixels');
  //   let sizePixels = document.getElementById('size-pixels');

  //   // Récupération des valeurs
  //   let valueNbPixels = Number(nbPixels.value);
  //   let valueSizePixels = Number(sizePixels.value);

  //   // Si les valeurs sont correctes, alors prise en compte
  //   // et on redessine le nouveau board avec ces parametres
  //   if (valueNbPixels && valueSizePixels) {
  //     app.gridSize = valueNbPixels;
  //     app.pixelSize = valueSizePixels;
  //     app.drawBoard();
  //   }
  // },

  /**
   * Cette fonction permet de gérer la construction et l'affichage
   * de la palette de couleurs
   */
  drawPalette: function () {
    // Création d'une div 'palette'
    let palette = document.createElement("div");
    palette.className = "palette";

    // dans la div 'palette' on ajoute 4 elements
    // avec les styles et les couleurs à prendre en compte
    app.styles.forEach(function (style) {
      // Création d'un élément anchor
      let anchor = document.createElement("a");

      // On ajoute le style inhérent a la couleur
      anchor.classList.add("palette-color", "palette--" + style);
      anchor.dataset.style = style;

      // Si la couleur actuellement séléctionné est la même que
      // celle de la boucle courante, alors on ajoute une classe
      // 'active-color' pour la différentier dans le document
      if (style == app.activeColor) {
        anchor.classList.add("active-color");
      }

      // Ajout d'un traitement sur 'click' d'une des 4 couleurs
      anchor.addEventListener("click", app.handleChangeCurrentColor);

      // Ajour de l'élément a la fin de la div 'palette'
      palette.appendChild(anchor);
    });
    // Ajout de la palette a fin du body
    document.body.appendChild(palette);
  },
  /**
   * Cette fonction gère l'événement click sur un bouton de
   * la palette de couleurs
   *
   * @param {Event} event
   */
  handleChangeCurrentColor: function (event) {
    // Va rechercher l'element qui est marqué comme actif
    // C'est a dire celui qui a la classe .active-color
    const oldColor = document.querySelector(".active-color");

    // On lui enleve la classe active
    oldColor.classList.remove("active-color");

    // Qu'on va mettre sur la nouvelle couleur choisie
    let newColor = event.target;
    newColor.classList.add("active-color");
    app.activeColor = event.target.dataset.style;
  },
};

// Lancement de l'application
app.init();
