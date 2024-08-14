import { BorderStyle, convertInchesToTwip } from "docx";

class DocumentConfig {
  // Page margins
  pageMargin = {
    top: convertInchesToTwip(0.31),  
    right: convertInchesToTwip(0.31),  
    bottom: convertInchesToTwip(0.31),  
    left: convertInchesToTwip(0.31), 
  };

  // Font settings
  font = "Arial";

  // Font size multipliers
  fontSizeMultiplier = 2.0; // Default multiplier

  // Font sizes
  fontSize = {
    minContentSize: 8,
    maxContentSize: 11,
    minTitleSize: 9,
    maxTitleSize: 11.5,
    contactInfoSize: 8.5,
    userNameSize: 14,
  };

  // Table column widths
  tableColumnWidth = {
    left: 70,
    right: 30,
  };

  // Line spacing
  lineSpacing = 1000;

  // Spacing after elements
  spacing = {
    sectionHeaderAfter: 100,
    tableAfter: 100,
    spacerAfter: 20,
    contentSpacerBefore: 50,
    contentSpacerAfter: 50,
    contentSpacerLine: 50,
  };

  // Border settings
  border = {
    sectionHeaderBottom: {
      style: BorderStyle.SINGLE,
      size: 6,
      color: "auto",
      space: 1,
    },
  };

  // Bullet points and symbols
  bullets = [
    "\u2022", // Level 0
    "\u00A5", // Level 1
    "\u273F", // Level 2
    "\u267A", // Level 3
    "\u2603", // Level 4
  ];

  // Text indentation
  textIndentation = {
    level0: { left: convertInchesToTwip(0.2), hanging: convertInchesToTwip(0.1) },
    level1: { left: convertInchesToTwip(1), hanging: convertInchesToTwip(0.25) },
    level2: { left: 2160, hanging: convertInchesToTwip(0.25) },  
    level3: { left: 2880, hanging: convertInchesToTwip(0.25) },  
    level4: { left: 3600, hanging: convertInchesToTwip(0.25) }, 
  };

  // Hyperlink settings
  hyperlink = {
    defaultLinkPrefix: "http://",
  };
}

export default new DocumentConfig();