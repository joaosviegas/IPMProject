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
    this.width = 150;  // Fixed width for all targets
    this.height = 60;  // Fixed height for all targets
    this.label = l;
    this.id = id;
    this.originalColor = getColorForLetter(l.charAt(0)); // Store original color
    this.color = this.originalColor; // Current color (starts as original)
    this.selected = false; // Track if this target has been selected before
    this.clickScale = 1.0; // For click animation
    this.clickAnimating = false; // Whether animation is in progress
    this.animationStartTime = 0; // When animation started
  }

  clicked(mouse_x, mouse_y) {
    // Check if mouse is within the rectangle bounds
    let hit = (
      mouse_x >= this.x - this.width / 2 &&
      mouse_x <= this.x + this.width / 2 &&
      mouse_y >= this.y - this.height / 2 &&
      mouse_y <= this.y + this.height / 2
    );
    
    if (hit) {
      // Start click animation
      this.clickAnimating = true;
      this.animationStartTime = millis();
      
      // Mark as selected and change color to grey
      if (this.id === trials[current_trial] + 1) {
        this.selected = true;
        this.color = color(180, 180, 180); // Grey color for selected items
      }
    }
    
    return hit;
  }

  draw() {
    // Update animation if needed
    if (this.clickAnimating) {
      let elapsed = millis() - this.animationStartTime;
      // Animation duration of 300ms
      if (elapsed < 300) {
        // Calculate scale - goes down to 0.9 and back to 1.0
        this.clickScale = 1.0 - 0.1 * sin(map(elapsed, 0, 300, 0, PI));
      } else {
        // End animation
        this.clickAnimating = false;
        this.clickScale = 1.0;
      }
    }
    
    push(); // Save current transformation state
    
    // Apply scaling for animation
    translate(this.x, this.y);
    scale(this.clickScale);
    
    // Draw rounded rectangle with assigned color
    fill(this.color);
    rectMode(CENTER);
    rect(0, 0, this.width, this.height, 5); // 5px corner radius
    
    // Draw label (centered both horizontally and vertically)
    textFont("Poppins", 18);
    fill(color(0, 0, 0)); // Black text
    textAlign(CENTER, CENTER);
    text(this.label, 0, 0);
    
    pop(); // Restore transformation state
  }
  
  // Reset to original state for new attempt
  reset() {
    this.selected = false;
    this.color = this.originalColor;
    this.clickScale = 1.0;
    this.clickAnimating = false;
  }
}

// Updated createTargets function
function createTargets(target_size, horizontal_gap, vertical_gap) {
  // Create a copy of the legendas table rows for sorting
  let sortedLegendas = [];
  for (let i = 0; i < legendas.getRowCount(); i++) {
    sortedLegendas.push({
      id: legendas.getNum(i, 0),
      city: legendas.getString(i, 1),
      firstLetter: legendas.getString(i, 1).charAt(0).toUpperCase()
    });
  }
  
  // First sort alphabetically by first letter
  sortedLegendas.sort((a, b) => {
    return a.firstLetter.localeCompare(b.firstLetter);
  });
  
  // Then sort by city name length within each first letter group
  let currentLetter = '';
  let startIndex = 0;
  
  for (let i = 0; i <= sortedLegendas.length; i++) {
    // If we're at a new letter or the end of the array
    if (i === sortedLegendas.length || sortedLegendas[i].firstLetter !== currentLetter) {
      // Sort the previous group by length (if we have a group)
      if (currentLetter !== '') {
        let group = sortedLegendas.slice(startIndex, i);
        group.sort((a, b) => b.city.length - a.city.length); // Longer names first
        
        // Replace the original entries with the sorted group
        for (let j = 0; j < group.length; j++) {
          sortedLegendas[startIndex + j] = group[j];
        }
      }
      
      // Start a new group if not at the end
      if (i < sortedLegendas.length) {
        currentLetter = sortedLegendas[i].firstLetter;
        startIndex = i;
      }
    }
  }
  
  // Define the margins between targets
  h_margin = horizontal_gap / (GRID_COLUMNS - 1);
  v_margin = vertical_gap / (GRID_ROWS - 1);
  
  // Set targets in a 8 x 10 grid
  targets = []; // Clear existing targets
  for (var r = 0; r < GRID_ROWS; r++) {
    for (var c = 0; c < GRID_COLUMNS; c++) {
      let target_x = 40 + (h_margin + target_size) * c + target_size / 2;
      let target_y = (v_margin + target_size) * r + target_size / 2;
      
      // Find the appropriate data from our sorted array
      let legendas_index = c + GRID_COLUMNS * r;
      let target_id = sortedLegendas[legendas_index].id;
      let target_label = sortedLegendas[legendas_index].city;
      
      let target = new Target(target_x, target_y + 40, target_size, target_label, target_id);
      targets.push(target);
    }
  }
}