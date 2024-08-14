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
import DocumentConfig from "../../utils/documentConfig.utils.mjs";


let fontSizeMultipler = DocumentConfig.fontSizeMultiplier;


const GenerateDocument = async (data, fontSizeReduction) => {
  try {
    fontSizeMultipler = fontSizeReduction;

    let document = CreateDocumentWithMetadata();

    document = CreateHeader(data, document);

    document = GenerateAllSections(data, document);

    const docxDocument = new Document(document);

    return docxDocument;

  } catch (error) {
    console.log(error);
    return true;
  }
};

const GenerateAllSections = (data, document) => {
  data.Sections.forEach((item) => {

    //Create the Section Header
    const sectionHeader = new Paragraph({
      children: [
        newTextRun({
          text: item.Title.toUpperCase(),
          size: TextSizeMultipler(DocumentConfig.fontSize.maxTitleSize),
          bold: true,
        }),
      ],
      border: {
        bottom: DocumentConfig.border.sectionHeaderBottom,
      },
      alignment: AlignmentType.LEFT,
      spacing: {
        after: DocumentConfig.spacing.sectionHeaderAfter,
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

      if (section.SingleColumnTable && section.SingleColumnTable.length > 0) {

        let singleColumnDataTable = CreateTableWithMetadata();

        section.SingleColumnTable.forEach((item) => {
          singleColumnDataTable.rows.push(GenerateNewRow(item, 2, true))
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
                  DocumentConfig.fontSize.maxContentSize
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
                  DocumentConfig.fontSize.maxContentSize
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
  const createTextRun = (text, bold = false, italics = false) =>
    newTextRun({
      text,
      size: TextSizeMultipler(DocumentConfig.fontSize.maxContentSize),
      bold,
      italics,
    });

  const createParagraph = (children, alignment) =>
    new Paragraph({
      children,
      alignment,
    });

  const createTableCell = (children, width = null, alignment = AlignmentType.LEFT) =>
    new TableCell({
      width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
      children: [createParagraph(children, alignment)],
    });

  if (singleColumn) {
    return new TableRow({
      children: [
        createTableCell([createTextRun(row, rowNum === 1, rowNum === 2)], 100),
      ],
    });
  }

  if (row.length > 2) {
    return new TableRow({
      children: [
        createTableCell([
          createTextRun(row[0], true),
          AddContactInfoData(" | ", null, false, true),
          createTextRun(row[1], false, true),
        ]),
        createTableCell([createTextRun(row[2], true)], null, AlignmentType.RIGHT),
      ],
    });
  }

  return new TableRow({
    children: [
      createTableCell([createTextRun(row[0], rowNum === 1, rowNum === 2)], DocumentConfig.tableColumnWidth.left),
      createTableCell([createTextRun(row[1], rowNum === 1, true)], DocumentConfig.tableColumnWidth.right, AlignmentType.RIGHT),
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
    spacing: { after: DocumentConfig.spacing.tableAfter },
  };
};

const CreateHeader = (data, document) => {
  const nameParagraph = new Paragraph({
    children: [
      newTextRun({
        text: data.Name.toUpperCase(),
        size: TextSizeMultipler(DocumentConfig.fontSize.userNameSize),
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

const TextSizeMultipler = (size, multiplyBy = DocumentConfig.fontSizeMultiplier) => {
  return size * multiplyBy * fontSizeMultipler;
};

const AddContactInfoData = (info, hyperLink = null, isEmail = false, isSizeMax = false) => {
  if (hyperLink) {
    return new ExternalHyperlink({
      children: [
        newTextRun({
          text: info,
          size: TextSizeMultipler(isSizeMax ? DocumentConfig.fontSize.maxContentSize : DocumentConfig.fontSize.contactInfoSize),
          style: "Hyperlink",
        }),
      ],
      link: isEmail ? "" : DocumentConfig.hyperlink.defaultLinkPrefix + hyperLink,
    });
  }

  return newTextRun({
    text: info,
    size: TextSizeMultipler(isSizeMax ? DocumentConfig.fontSize.maxContentSize : DocumentConfig.fontSize.contactInfoSize),
  });
};

const CreateDocumentWithMetadata = () => {
  return {
    numbering: {
      config: [
        {
          reference: "my-unique-bullet-points",
          levels: DocumentConfig.bullets.map((bullet, index) => ({
            level: index,
            format: LevelFormat.BULLET,
            text: bullet,
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: DocumentConfig.textIndentation[`level${index}`],
              },
            },
          })),
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: DocumentConfig.pageMargin,
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
      after: DocumentConfig.spacing.spacerAfter, // Adjust space after the blank line
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
      before: DocumentConfig.spacing.contentSpacerBefore, // Space before the paragraph starts
      after: DocumentConfig.spacing.contentSpacerAfter, // Space after the paragraph ends
      line: DocumentConfig.spacing.contentSpacerLine, // This sets line spacing
    }
  });
};

const newTextRun = (params) => {
  params.font = DocumentConfig.font;
  return new TextRun(params);
}

export default {
  GenerateDocument
};