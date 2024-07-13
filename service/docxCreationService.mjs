import * as fs from "fs";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  ExternalHyperlink,
  BorderStyle,
  TableCell,
  Table,
  TableRow,
  WidthType,
  LevelFormat,
  convertInchesToTwip,
} from "docx";
import PageSpecifications from "../utils/pageSpecification.utils.mjs";
import path from 'path';
import unoconv from 'awesome-unoconv';
import { PDFDocument } from 'pdf-lib';

const fileName = "./output/Samirasimha_Resume.docx";
const fileNamePdf = "./output/Samirasimha_Resume.pdf";

let fontSizeMultipler = 1.0;

const InitProduction = async () => {
  await CreateFiles(); // Ensure that file creation is complete before proceeding


  // let pageCount = await countPages();

  // while (pageCount > 1) {
  //   console.log("Inside Loop");
  //   fontSizeMultiplier -= 0.05; // Assuming this impacts the CreateFiles() or countPages() somehow

  //   if (fontSizeMultipler <= 0.1) {
  //     console.error("Font size multiplier too small. Exiting loop.");
  //     break;
  //   }

  //   await CreateFiles(); // Wait for this operation to complete before the next iteration

  //   pageCount = await countPages();

  //   if (pageCount === null) {
  //     break;
  //   }
  // }

  return true;
}

// Documents contain sections, you can have multiple sections per document, go here to learn more about sections
// This simple example will only contain one section
const CreateFiles = async () => {
  let document = CreateDocumentWithMetadata();

  var data = JSON.parse(fs.readFileSync("./data/MyResume.json"));

  document = CreateHeader(data, document);

  document = GenerateAllSections(data, document);

  const doc = new Document(document);

  // Used to export the file into a .docx file
  Packer.toBuffer(doc)
  .then((buffer) => {
    if (fs.existsSync(fileName)) {
      fs.unlinkSync(fileName); // Delete the file if it exists
    }
    if (fs.existsSync(fileNamePdf)) {
      fs.unlinkSync(fileNamePdf); // Delete the file if it exists
    }
    fs.writeFileSync(fileName, buffer);
    // return fileName;
  })
  .then(() => {
     ExportToPdf(fileName);
  })
  .then((result)=> {
    // if(result)
      // countPages();
  })
  ;

  return true;
};

const GenerateAllSections = (data, document) => {
  data.Sections.forEach((item) => {
    //Create the Section Header

    const sectionHeader = new Paragraph({
      children: [
        new TextRun({
          text: item.Title.toUpperCase(),
          size: TextSizeMultipler(PageSpecifications.fontSize.maxTitleSize),
          bold: true,
        }),
      ],
      border: {
        bottom: {
          color: "auto",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      alignment: AlignmentType.LEFT,
      spacing: {
        after: 100,
      },
    });

    document.sections[0].children.push(createSpacer());
    document.sections[0].children.push(sectionHeader);

    item.Content.forEach((section) => {
      document.sections[0].children.push(createContentSpacer());

      let dataTable = CreateTableWithMetadata();

      let hasTable = false;
      if (section.row1.length > 0) {
        dataTable.rows.push(GenerateNewRow(section.row1, 1));
        hasTable = true;
      }

      if (section.row2.length > 0) {
        dataTable.rows.push(GenerateNewRow(section.row2, 2));
        hasTable = true;
      }

      if (hasTable) {
        document.sections[0].children.push(new Table(dataTable));
      }

      if (section.description) {
        section.description.forEach((textDesc) => {
          const newPoint = {
            children: [],
            numbering: {
              reference: "my-unique-bullet-points",
              level: 0,
            },
          };
          if (textDesc?.subTitle) {
            newPoint.children.push(
              new TextRun({
                text: textDesc.subTitle + ": ",
                size: TextSizeMultipler(
                  PageSpecifications.fontSize.maxContentSize
                ),
                bold: true,
              })
            );
          }
          if (textDesc?.text) {
            newPoint.children.push(
              new TextRun({
                text: textDesc.text,
                size: TextSizeMultipler(
                  PageSpecifications.fontSize.maxContentSize
                ),
              })
            );
          }

          document.sections[0].children.push(new Paragraph(newPoint));
        });
      }
    });
  });

  return document;
};

const GenerateNewRow = (row, rowNum) => {
  return new TableRow({
    children: [
      new TableCell({
        width: {
          size: PageSpecifications.tableColumnWidth.left,
          type: WidthType.PERCENTAGE,
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: row[0],
                size: TextSizeMultipler(
                  PageSpecifications.fontSize.maxContentSize
                ),
                bold: rowNum == 1,
                italics: rowNum == 2,
              }),
            ],
            alignment: AlignmentType.LEFT,
          }),
        ],
      }),
      new TableCell({
        width: {
          size: PageSpecifications.tableColumnWidth.right,
          type: WidthType.PERCENTAGE,
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: row[1],
                size: TextSizeMultipler(
                  PageSpecifications.fontSize.maxContentSize
                ),
                bold: rowNum == 1,
                italics: true,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
        ],
      }),
    ],
  });
};

const CreateTableWithMetadata = () => {
  return {
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.NIL },
      bottom: { style: BorderStyle.NIL },
      left: { style: BorderStyle.NIL },
      right: { style: BorderStyle.NIL },
      insideVertical: { style: BorderStyle.NIL },
      insideHorizontal: { style: BorderStyle.NIL },
    },
    rows: [],
    spacing: { after: 100 },
  };
};

const CreateHeader = (data, document) => {
  const nameParagraph = new Paragraph({
    children: [
      new TextRun({
        text: data.Name.toUpperCase(),
        size: TextSizeMultipler(PageSpecifications.fontSize.userNameSize),
      }),
    ],
    alignment: AlignmentType.CENTER,
  });

  document.sections[0].children.push(nameParagraph);

  let contactInfo = {
    children: [],
    alignment: AlignmentType.CENTER,
  };

  if (data.Phone) {
    contactInfo.children.push(AddContactInfoData(data.Phone));
    contactInfo.children.push(AddContactInfoData(" | "));
  }
  if (data.Email) {
    contactInfo.children.push(AddContactInfoData(data.Email, data.Email, true));
    contactInfo.children.push(AddContactInfoData(" | "));
  }

  data.Links.forEach((element) => {
    contactInfo.children.push(AddContactInfoData(element.Title, element.Url));
    contactInfo.children.push(AddContactInfoData(" | "));
  });

  contactInfo.children.pop();

  document.sections[0].children.push(new Paragraph(contactInfo));
  return document;
};

const TextSizeMultipler = (size, multiplyBy = 2) => {
  return size * multiplyBy * fontSizeMultipler;
};

const AddContactInfoData = (info, hyperLink = null, isEmail = false) => {
  if (hyperLink) {
    return new ExternalHyperlink({
      children: [
        new TextRun({
          text: info,
          size: TextSizeMultipler(PageSpecifications.fontSize.contactInfoSize),
          style: "Hyperlink",
        }),
      ],
      link: isEmail ? "" : "http://" + hyperLink,
    });
  }

  return new TextRun({
    text: info,
    size: TextSizeMultipler(PageSpecifications.fontSize.contactInfoSize),
  });
};

const CreateDocumentWithMetadata = () => {
  return {
    numbering: {
      config: [
        {
          reference: "my-unique-bullet-points",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(0.5),
                    hanging: convertInchesToTwip(0.25),
                  },
                },
              },
            },
            {
              level: 1,
              format: LevelFormat.BULLET,
              text: "\u00A5",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(1),
                    hanging: convertInchesToTwip(0.25),
                  },
                },
              },
            },
            {
              level: 2,
              format: LevelFormat.BULLET,
              text: "\u273F",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 2160, hanging: convertInchesToTwip(0.25) },
                },
              },
            },
            {
              level: 3,
              format: LevelFormat.BULLET,
              text: "\u267A",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 2880, hanging: convertInchesToTwip(0.25) },
                },
              },
            },
            {
              level: 4,
              format: LevelFormat.BULLET,
              text: "\u2603",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 3600, hanging: convertInchesToTwip(0.25) },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: PageSpecifications.pageMargin.top,
              right: PageSpecifications.pageMargin.right,
              bottom: PageSpecifications.pageMargin.bottom,
              left: PageSpecifications.pageMargin.left,
            },
          },
        },
        children: [],
      },
    ],
  };
};


const createSpacer = () => {
  return new Paragraph({
    children: [
      new TextRun({
        text: "", 
      }),
    ],
    spacing: {
      after: 20, // Adjust space after the blank line, if needed
    },
  });
};

const createContentSpacer = () => {
  return new Paragraph({
    children: [
      new TextRun({
        text: " ", // Adding a space character
      }),
    ],
    spacing: {
      before: 50, // Space before the paragraph starts
      after: 50, // Space after the paragraph ends
      line: 50, // This sets line spacing; adjust as needed (values are in twentieths of a point)
    }
  });
};

async function countPages() {
  try {
      const fileBuffer = fs.readFileSync(fileNamePdf);
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const number = pdfDoc.getPageCount();
      console.log(number);
      return number;
  } catch (error) {
      console.error("Error reading the PDF:", error);
      return null;  // Return null in case of error
  }
}


const ExportToPdf = (docxPath) => {

  const sourceFilePath = path.resolve(docxPath);
  const outputFilePath = path.resolve(fileNamePdf);
   console.log("It's here")
  unoconv
    .convert(sourceFilePath, outputFilePath)
    .then(result => {
      console.log(result); // return outputFilePath
      return true;
    })
    .catch(err => {
      console.log(err);
    });
  
    
  }

export default {
  CreateFiles,
  InitProduction
};
