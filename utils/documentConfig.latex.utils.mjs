import { BorderStyle, convertInchesToTwip } from "docx";

class DocumentConfig {
  // Page margins
  pageMargin = 0.3;

  // Font settings
  font = "Arial";

  // Font size multipliers
  fontSizeMultiplier = 2.0; // Default multiplier

  // Font sizes
  fontSize = {
    contentSize : 12,
    userNameSize: 20,
    reductionOffset : 0.05
  };

  bulletPointSpacing = 1

  // Hyperlink settings
  hyperlink = {
    defaultLinkPrefix: "http://",
  };
}

export default new DocumentConfig();