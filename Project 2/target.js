// Function to get the color based on the first letter
function getColorForLetter(letter) {
  // Create a mapping of letters to high-contrast colors with improved visibility
  const colorMap = {
    'A': color(255, 105, 97),   // Coral
    'B': color(255, 180, 0),    // Amber
    'C': color(106, 168, 79),   // Medium Green
    'D': color(61, 133, 198),   // Strong Blue
    'E': color(255, 103, 0),    // Bright Orange
    'F': color(180, 160, 255),  // Blue Violet
    'G': color(255, 255, 0),    // Yellow
    'H': color(34, 139, 34),    // Forest Green
    'I': color(173, 216, 230),  // Light Blue
    'J': color(0, 191, 255),    // Deep Sky Blue
    'K': color(220, 20, 60),    // Crimson
    'L': color(211, 211, 211),  // Light Gray
    'M': color(255, 69, 0),     // Red Orange
    'N': color(64, 224, 208),   // Light Sea Green
    'O': color(128, 0, 128),    // Purple
    'P': color(30, 144, 255),   // Dodger Blue
    'Q': color(186, 85, 211),   // Medium Orchid
    'R': color(50, 205, 50),    // Lime Green
    'S': color(255, 215, 0),    // Gold
    'T': color(255, 140, 0),    // Dark Orange
    'U': color(0, 206, 209),    // Dark Turquoise
    'V': color(255, 182, 193),  // Light Pink
    'W': color(70, 130, 180),   // Steel Blue
    'X': color(169, 169, 169),  // Dark Gray
    'Y': color(0, 255, 127),    // Spring Green
    'Z': color(255, 20, 147)    // Deep Pink
  };

  // Convert the letter to uppercase
  const upperLetter = letter.toUpperCase();

  // Return the color if it exists; otherwise, white
  return colorMap[upperLetter] || color(255, 255, 255);
}

// Updated Target class with improved visuals and added hover effect
class Target {
  constructor(x, y, w, l, id) {
    this.x = x;
    this.y = y;
    this.width = w*2;  // Use o tamanho passado como parâmetro
    this.height = w * 1;  // Ajuste a proporção conforme necessário
    this.label = l;
    this.id = id;
    this.originalColor = getColorForLetter(l.charAt(0)); // Store original color
    this.color = this.originalColor; // Current color (starts as original)
    this.selected = false; // Indicates if the target has been selected
    this.clickScale = 1.0; // For click animation
    this.clickAnimating = false; // If the animation is in progress
    this.animationStartTime = 0; // When the animation started
    this.abbreviation = l.substring(0, 3).toUpperCase(); // First 3 letters
    this.clickedBefore = false; // Property to track if target was ever clicked
  }

  // New method to detect if the mouse is hovering over the target
  isHovered() {
    return (
      mouseX >= this.x - this.width / 2 &&
      mouseX <= this.x + this.width / 2 &&
      mouseY >= this.y - this.height / 2 &&
      mouseY <= this.y + this.height / 2
    );
  }

  clicked(mouse_x, mouse_y) {
    // Check if the mouse is within the rectangle bounds
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
      
      // Mark this target as being clicked before
      this.clickedBefore = true;
    }
    
    return hit;
  }

  draw() {
    // Update the animation if necessary
    if (this.clickAnimating) {
      let elapsed = millis() - this.animationStartTime;
      // Animation duration: 300ms
      if (elapsed < 300) {
        // Calculate the scale – decreases to 0.9 and returns to 1.0
        this.clickScale = 1.0 - 0.1 * sin(map(elapsed, 0, 300, 0, PI));
      } else {
        // End the animation
        this.clickAnimating = false;
        this.clickScale = 1.0;
      }
    }
    
    push();
    translate(this.x, this.y);
    scale(this.clickScale);

    // Add hover effect to improve target salience
    if (this.isHovered()) {
      noFill();
      stroke(255, 255, 255, 150); // Semi-transparent white outline
      strokeWeight(6);
      rectMode(CENTER);
      rect(0, 0, this.width + 8, this.height + 8, 8);
    }

    // Draw the background rectangle with a border for better contrast
    fill(this.color);
    strokeWeight(2);
    
    // Change border for clicked targets - make it more noticeable
    if (this.clickedBefore) {
      stroke(255, 255, 255); // White border
      strokeWeight(4); // Thicker border
    } else {
      stroke(40, 40, 40); // Original dark border
    }
    
    rectMode(CENTER);
    rect(0, 0, this.width, this.height, 5);
    
    // Add a check mark or indicator for clicked targets
    if (this.clickedBefore) {
      // Add a star in the top-right corner
      push();
      translate(this.width/2 - 15, -this.height/2 + 15);
      noStroke();
      fill(255, 255, 255); // White star
      
      // Draw a simple star
      beginShape();
      for (let i = 0; i < 5; i++) {
        let angle = TWO_PI * i / 5 - HALF_PI;
        let x1 = cos(angle) * 7;
        let y1 = sin(angle) * 7;
        vertex(x1, y1);
        
        angle += TWO_PI / 10;
        let x2 = cos(angle) * 3;
        let y2 = sin(angle) * 3;
        vertex(x2, y2);
      }
      endShape(CLOSE);
      pop();
      
      // Add a subtle highlight effect
      noFill();
      stroke(255, 255, 255, 100); // Semi-transparent white
      strokeWeight(2);
      rect(0, 0, this.width - 8, this.height - 8, 3); // Inner glow effect
    }

    // Calculate text dimensions
    const maxWidth = this.width - 20; // 10px padding on each side
    
    // For very long texts, allow more vertical space
    const textLength = this.label.length;
    let abbreviationHeight, maxTextHeight;
    
    if (textLength > 40) {
      // For very long texts, make the abbreviation smaller and give more space to the main text
      abbreviationHeight = this.height/4.5;  // Less space for the abbreviation
      maxTextHeight = this.height - 25;    // More space for the main text
    } else {
      // Default configuration
      abbreviationHeight = this.height/3.5;
      maxTextHeight = this.height - 30;
    }
    
    // Background for the abbreviation (better highlight)
    fill(0, 0, 0, 90); // Increased opacity to 80 for better contrast
    noStroke();
    rect(0, -abbreviationHeight, this.width - 10, 28, 3); // Adjust position and size
    
    // Draw the abbreviation with improved highlight
    textFont("Poppins", 22); // Slightly smaller size to avoid overlap
    textStyle(BOLD);
    fill(255);
    
    textAlign(CENTER, CENTER);
    text(this.abbreviation, 0, -abbreviationHeight);
    textStyle(NORMAL);
    
    // Adjust the vertical position of the main text based on its length
    let textY = this.height/6;
    if (textLength > 50) {
      textY = this.height/8; // Move the main text slightly higher
    }
    if (textLength > 80) {
      textY = this.height/10; // Even higher for extremely long texts
    }
    
    // Draw the main label with automatic line break
    textFont("Poppins", this.calculateFontSize());
    fill(0);
    textAlign(CENTER, CENTER);
    this.wrapText(this.label, 0, textY, maxWidth, maxTextHeight);

    pop();
  }

  calculateFontSize() {
    // Simplified approach to calculate font size
    const baseSize = 22; // Base size reduced to 18
    const maxLength = 15; // Number of characters before starting to reduce size
    
    // For very short texts, keep larger fonts
    if (this.label.length <= 10) {
      return 24;
    } else if (this.label.length <= 15) {
      return 20;
    }
    
    // Reduce size by 1 for each additional character beyond maxLength
    // But maintain a minimum size of 14
    const calculatedSize = baseSize - Math.max(0, this.label.length - maxLength);
    
    // Final adjustment for very long words
    const longestWord = this.getLongestWordLength();
    if (longestWord > 15) {
      return Math.max(12, calculatedSize - 2);
    }
    
    return Math.max(14, calculatedSize);
  }

  getLongestWordLength() {
    const words = this.label.split(' ');
    let maxLength = 0;
    
    for (let word of words) {
      maxLength = Math.max(maxLength, word.length);
    }
    
    return maxLength;
  }

  wrapText(str, x, y, maxWidth, maxHeight) {
    // Set the font with calculated size
    const fontSize = this.calculateFontSize();
    textFont("Poppins", fontSize);
    
    // Special handling for short texts - no need to break words
    if (str.length <= 10) {
      textAlign(CENTER, CENTER);
      text(str, x, y);
      return;
    }
    
    // Break very long words that wouldn't fit in a single line
    let processedWords = [];
    let words = str.split(' ');
    
    for (let word of words) {
      if (textWidth(word) > maxWidth * 0.9) {
        // Break very long words into parts
        let currentPart = "";
        for (let char of word) {
          let testPart = currentPart + char;
          if (textWidth(testPart) > maxWidth * 0.85) {
            processedWords.push(currentPart + "-");
            currentPart = char;
          } else {
            currentPart += char;
          }
        }
        if (currentPart.length > 0) {
          processedWords.push(currentPart);
        }
      } else {
        processedWords.push(word);
      }
    }
    
    // The rest of the function remains the same...
    // Line-breaking algorithm with processed words
    let lines = [];
    let currentLine = processedWords[0] || "";
  
    for (let i = 1; i < processedWords.length; i++) {
      let testLine = currentLine + ' ' + processedWords[i];
      let testWidth = textWidth(testLine);
      
      if (testWidth > maxWidth) {
        lines.push(currentLine);
        currentLine = processedWords[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  
    // Vertical text centering
    const lineHeight = textAscent() + textDescent() + 2; // Add a small spacing
    let totalHeight = lines.length * lineHeight;
    
    // If the text is still too large for the available space
    if (totalHeight > maxHeight) {
      // Further reduce font size for extreme cases
      const scaleFactor = maxHeight / totalHeight;
      const newFontSize = Math.max(5, Math.floor(fontSize * scaleFactor));
      
      textFont("Poppins", newFontSize);
      const newLineHeight = textAscent() + textDescent() + 1; // Reduced spacing
      totalHeight = lines.length * newLineHeight;
      
      const startY = y - (totalHeight / 2) + (newLineHeight / 2);
      // Draw each line with the reduced size
      for (let i = 0; i < lines.length; i++) {
        text(lines[i], x, startY + (i * newLineHeight));
      }
    } else {
      const startY = y - (totalHeight / 2) + (lineHeight / 2);
      // Draw each line normally
      for (let i = 0; i < lines.length; i++) {
        text(lines[i], x, startY + (i * lineHeight));
      }
    }
  }

  // Reset the target for a new attempt
  reset() {
    this.selected = false;
    this.color = this.originalColor;
    this.clickScale = 1.0;
    this.clickAnimating = false;
    this.clickedBefore = false;
  }
}

// Function to create targets with alphabetical sorting similar to the second code
function createTargets(target_size, horizontal_gap, vertical_gap) {
  // Create a copy of the legendas table data for sorting
  let sortedLegendas = [];
  for (let i = 0; i < legendas.getRowCount(); i++) {
    sortedLegendas.push({
      id: legendas.getNum(i, 0),
      city: legendas.getString(i, 1),
      firstTwoLetters: legendas.getString(i, 1).substring(0, 2).toUpperCase()
    });
  }
  
  // First, sort alphabetically by the first two characters
  sortedLegendas.sort((a, b) => a.firstTwoLetters.localeCompare(b.firstTwoLetters));
  
  // Then, for each group with the same prefix, sort by the number of characters (longer names first)
  let currentPrefix = '';
  let startIndex = 0;
  for (let i = 0; i <= sortedLegendas.length; i++) {
    // If we change the prefix or reach the end of the array
    if (i === sortedLegendas.length || sortedLegendas[i].firstTwoLetters !== currentPrefix) {
      if (currentPrefix !== '') {
        let group = sortedLegendas.slice(startIndex, i);
        group.sort((a, b) => b.city.length - a.city.length); // Longer names first
        // Replace the original items with the sorted group
        for (let j = 0; j < group.length; j++) {
          sortedLegendas[startIndex + j] = group[j];
        }
      }
      // Start a new group if not at the end
      if (i < sortedLegendas.length) {
        currentPrefix = sortedLegendas[i].firstTwoLetters;
        startIndex = i;
      }
    }
  }
  
  // Define the margins between the targets
  h_margin = horizontal_gap / (GRID_COLUMNS - 1);
  v_margin = vertical_gap / (GRID_ROWS - 1);
  
  // Create the targets in a grid format
  targets = []; // Clear existing targets
  for (var r = 0; r < GRID_ROWS; r++) {
    for (var c = 0; c < GRID_COLUMNS; c++) {
      let target_x = 40 + (h_margin + target_size) * c + target_size / 2;
      let target_y = (v_margin + target_size) * r + target_size / 2;
      
      // Calculate the corresponding index in the sorted list
      let legendas_index = c + GRID_COLUMNS * r;
      
      // Check if it does not exceed the array limits
      if (legendas_index < sortedLegendas.length) {
        let target_id = sortedLegendas[legendas_index].id;
        let target_label = sortedLegendas[legendas_index].city;
        
        let target = new Target(target_x, target_y + 40, target_size, target_label, target_id);
        targets.push(target);
      }
    }
  }
}