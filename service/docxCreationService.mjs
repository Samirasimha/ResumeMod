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
import { PDFDocument } from 'pdf-lib';
import unoconv from 'awesome-unoconv';
import { json } from "express";
import RegexSpecs from "../utils/regex.utils.mjs";


const outputDir = "./output/"

let fileName = "";

let fontSizeMultipler = 1.0;

const InitProduction = async () => {

  let pageCount = 2;
  while (pageCount > 1) {

    await CreateFiles();

    pageCount = await countPages();

    fontSizeMultipler -= 0.05;
    console.log("Number of pages Exceeded.. Regenerating File.");
  }

  return true;
}

// Documents contain sections, you can have multiple sections per document, go here to learn more about sections
// This simple example will only contain one section
const CreateFiles = async () => {
  try {
    let document = CreateDocumentWithMetadata();

    var data = JSON.parse(fs.readFileSync("./data/MyResume_Django.json"));

    await SetFileName(data);

    document = CreateHeader(data, document);

    document = GenerateAllSections(data, document);

    const doc = new Document(document);

    // Used to export the file into a .docx file
    await Packer.toBuffer(doc)
      .then((buffer) => {
        if (fs.existsSync(getDocxFileName())) {
          fs.unlinkSync(getDocxFileName()); // Delete the file if it exists
        }
        if (fs.existsSync(getPdfFileName())) {
          fs.unlinkSync(getPdfFileName()); // Delete the file if it exists
        }
        fs.writeFileSync(getDocxFileName(), buffer);
      })
      .then(async () => {
        await ExportToPdf(getDocxFileName());
      });

    return true;
  }
  catch (error) {
    console.log(error);
    return true;
  }
};

const SetFileName = (jsonData) => {
  console.log(jsonData.Name);
  fileName = jsonData.Name.replace(/ /g, "_");
}

const getDocxFileName = () => {
  return outputDir + fileName + ".docx";
}

const getPdfFileName = () => {
  return outputDir + fileName + ".pdf";
}

const GenerateAllSections = (data, document) => {
  data.Sections.forEach((item) => {

    //Create the Section Header
    const sectionHeader = new Paragraph({
      children: [
        newTextRun({
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
      if (section.row1?.length > 0) {
        dataTable.rows.push(GenerateNewRow(section.row1, 1));
        hasTable = true;
      }

      if (section.row2?.length > 0) {
        dataTable.rows.push(GenerateNewRow(section.row2, 2));
        hasTable = true;
      }

      if (hasTable) {
        document.sections[0].children.push(new Table(dataTable));
      }

      //If Single Row Tables Exist. Add it here. 

      if (section.SingleColumnTable && section.SingleColumnTable.length > 0){

        let singleColumnDataTable = CreateTableWithMetadata();

        section.SingleColumnTable.forEach((item) => {
          singleColumnDataTable.rows.push(GenerateNewRow(item, 2,true))
        });

        document.sections[0].children.push(new Table(singleColumnDataTable));

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
              newTextRun({
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
              newTextRun({
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

const GenerateNewRow = (row, rowNum, singleColumn = false) => {


  if (singleColumn){
    return new TableRow({
      children: [
        new TableCell({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          children: [
            new Paragraph({
              children: [
                newTextRun({
                  text: row,
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
        })
      ],
    });
  }
  else if (row.length > 2) {

    return new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                newTextRun({
                  text: row[0],
                  size: TextSizeMultipler(
                    PageSpecifications.fontSize.maxContentSize
                  ),
                  bold: true,
                }),
                AddContactInfoData(" | ",null,false,true),
                newTextRun({
                  text: row[1],
                  size: TextSizeMultipler(
                    PageSpecifications.fontSize.maxContentSize
                  ),
                  italics: true,
                })
              ],
              alignment: AlignmentType.LEFT,
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                newTextRun({
                  text: row[2],
                  size: TextSizeMultipler(
                    PageSpecifications.fontSize.maxContentSize
                  ),
                  bold: true
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      ],
    });
  }
  else {
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
                newTextRun({
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
                newTextRun({
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
  }
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
      newTextRun({
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

const AddContactInfoData = (info, hyperLink = null, isEmail = false, isSizeMax = false) => {
  if (hyperLink) {
    return new ExternalHyperlink({
      children: [
        newTextRun({
          text: info,
          size: TextSizeMultipler(isSizeMax ? PageSpecifications.fontSize.maxContentSize : PageSpecifications.fontSize.contactInfoSize),
          style: "Hyperlink",
        }),
      ],
      link: isEmail ? "" : "http://" + hyperLink,
    });
  }

  return newTextRun({
    text: info,
    size: TextSizeMultipler(isSizeMax ? PageSpecifications.fontSize.maxContentSize : PageSpecifications.fontSize.contactInfoSize),
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
                    left: convertInchesToTwip(0.2),
                    hanging: convertInchesToTwip(0.1),
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
      newTextRun({
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
      newTextRun({
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
    const fileBuffer = fs.readFileSync(getPdfFileName());
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const number = pdfDoc.getPageCount();
    console.log("Number of Pages : " + number);
    return number;
  } catch (error) {
    console.error("Error reading the PDF:", error);
    return null;  // Return null in case of error
  }
}





const ExportToPdf = async () => {

  const sourceFilePath = path.resolve(getDocxFileName());
  const outputFilePath = path.resolve(getPdfFileName());
  await unoconv
    .convert(sourceFilePath, outputFilePath)
    .then(result => {
      console.log(result); // return outputFilePath
      return true;
    })
    .catch(err => {
      return true;
    });

}

const newTextRun = (params) => {
  params.font = PageSpecifications.font;
  return new TextRun(params);
}

export default {
  CreateFiles,
  InitProduction
};
