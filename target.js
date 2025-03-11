function getColorForLetter(letter) {
    const colors = [
      color(240, 128, 128), // A: Light Coral (soft red)
      color(255, 160, 122), // B: Light Salmon (soft orange)
      color(255, 182, 193), // C: Light Pink (soft pink)
      color(255, 223, 186), // D: Peach (soft peach)
      color(255, 218, 185), // E: Peach Puff (soft peach)
      color(255, 228, 181), // F: Moccasin (soft gold)
      color(255, 239, 180), // G: Light Goldenrod (softer yellow)
      color(255, 248, 200), // H: Pale Lemon (lighter yellow)
      color(255, 250, 205), // I: Lemon Chiffon (soft yellow)
      color(240, 230, 140), // J: Khaki (soft yellow-green)
      color(154, 205, 50),  // K: Yellow Green (yellow-green)
      color(144, 238, 144), // L: Light Green (soft green)
      color(152, 251, 152), // M: Pale Green (soft green)
      color(102, 205, 170), // N: Medium Aquamarine (soft teal)
      color(175, 238, 238), // O: Pale Turquoise (soft cyan)
      color(173, 216, 230), // P: Light Blue (soft blue)
      color(176, 224, 230), // Q: Powder Blue (soft blue)
      color(100, 149, 237), // R: Cornflower Blue (soft navy)
      color(106, 90, 205),  // S: Slate Blue (soft slate blue)
      color(147, 112, 219), // T: Medium Purple (soft blue violet)
      color(221, 160, 221), // U: Plum (soft purple)
      color(216, 191, 216), // V: Thistle (soft magenta)
      color(255, 192, 203), // W: Pink (soft pink)
      color(210, 180, 140), // X: Tan (neutral tan)
      color(189, 183, 107), // Y: Dark Khaki (muted olive)
      color(205, 92, 92)    // Z: Indian Red (soft maroon)
    ];
  
    // Get the index of the letter (A=0, B=1, ..., Z=25)
    const index = letter.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    // Use modulo to handle letters beyond Z
    return colors[index % colors.length];
  }
  
  // Updated Target class
  class Target {
    constructor(x, y, w, l, id) {
      this.x = x;
      this.y = y;
      this.width = 140;  // Fixed width for all targets
      this.height = 50;  // Fixed height for all targets
      this.label = l;
      this.id = id;
      this.color = getColorForLetter(l.charAt(0)); // Assign color based on the first letter
    }
  
    clicked(mouse_x, mouse_y) {
      // Check if mouse is within the rectangle bounds
      return (
        mouse_x >= this.x - this.width / 2 &&
        mouse_x <= this.x + this.width / 2 &&
        mouse_y >= this.y - this.height / 2 &&
        mouse_y <= this.y + this.height / 2
      );
    }
  
    draw() {
      // Draw rounded rectangle with assigned color
      fill(this.color);
      rectMode(CENTER);
      rect(this.x, this.y, this.width, this.height, 5); // 5px corner radius
  
      // Draw label (centered both horizontally and vertically)
      textFont("Poppins", 18);
      fill(color(0, 0, 0)); // Black text !!!
      textAlign(CENTER, CENTER);
      text(this.label, this.x, this.y);
    }
  }
  
  // Updated createTargets function
  function createTargets(target_size, horizontal_gap, vertical_gap) {
    // Sort the legendas table alphabetically by the city names (column index 1)
    let sortedLegendas = legendas.rows.slice(); // Create a copy of the rows
    sortedLegendas.sort((a, b) => {
      let cityA = a.getString(1).toLowerCase(); // Get city name from column 1
      let cityB = b.getString(1).toLowerCase(); // Get city name from column 1
      return cityA.localeCompare(cityB); // Sort alphabetically
    });
  
    // Define the margins between targets by dividing the white space 
    // for the number of targets minus one
    h_margin = horizontal_gap / (GRID_COLUMNS - 1);
    v_margin = vertical_gap / (GRID_ROWS - 1);
  
    // Set targets in a 8 x 10 grid
    for (var r = 0; r < GRID_ROWS; r++) {
      for (var c = 0; c < GRID_COLUMNS; c++) {
        let target_x = 40 + (h_margin + target_size) * c + target_size / 2; // give it some margin from the left border
        let target_y = (v_margin + target_size) * r + target_size / 2;
  
        // Find the appropriate label and ID for this target using the sorted data
        let legendas_index = c + GRID_COLUMNS * r;
        let target_id = sortedLegendas[legendas_index].getNum(0); // ID from column 0
        let target_label = sortedLegendas[legendas_index].getString(1); // City name from column 1
  
        let target = new Target(target_x, target_y + 40, target_size, target_label, target_id);
        targets.push(target);
      }
    }
  }