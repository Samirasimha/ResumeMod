import * as fs from "fs";

import {
  Packer
} from "docx";
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import unoconv from 'awesome-unoconv';
import template_ondu from './Templates/ondu.template.mjs';
import OutputFileSpecifications from '../utils/outputFileSpecs.utils.mjs';
import DocumentConfig from '../utils/documentConfig.utils.mjs';
import dotenv from 'dotenv';
import libre from 'libreoffice-convert'; // Using ES6 import syntax
import { promisify } from 'util';         // Import promisify from util

libre.convertAsync = promisify(libre.convert);

dotenv.config();


console.log(process.env.SOURCE_PATH);
const source = process.env.SOURCE_PATH || './data/MyResume.json';
const outputDir = process.env.OUTPUT_DIR || './output/';

let fileName = "";
let fontSizeMultipler = 1.0;

const InitProduction = async () => {

  if (!fs.existsSync(source)) {
    console.log("No file found in the data folder");
    return false; // Exit the function if the source file does not exist
  }

  var parsedJsonResume = JSON.parse(fs.readFileSync(source));

  await SetFileName(parsedJsonResume);

  let pageCount = 2;
  while (pageCount > OutputFileSpecifications.pageLimit) {

    const document = await template_ondu.GenerateDocument(parsedJsonResume,fontSizeMultipler);
    if (!document) {
      console.error("File creation failed, exiting loop.");
      break;
    }

    await GenerateFiles(document);

    pageCount = await countPages();
    if (pageCount === null) {
      console.error("Error counting pages, exiting loop.");
      break;
    }
    if (pageCount > OutputFileSpecifications.pageLimit) {
      console.log("Number of pages Exceeded.. Regenerating File.");
    }

    fontSizeMultipler -= DocumentConfig.fontSize.reductionOffset;

  }

  console.log("Resume is Generated, Please look into the ./output folder for the files. ")
  return true;
}

const GenerateFiles = async (doc) => {
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

const countPages = async () => {
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

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const ExportToPdf = async () => {
  const ext = '.pdf';
  const inputPath = path.resolve(getDocxFileName());
  const outputPath = path.resolve(getPdfFileName());

  try {
    // Read file using the promisified readFile
    const docxBuf = await readFileAsync(inputPath);

    // Manually wrap `libre.convert` in a Promise
    const pdfBuf = await new Promise((resolve, reject) => {
      libre.convert(docxBuf, ext, undefined, (err, done) => {
        if (err) {
          return reject(err);
        }
        resolve(done);
      });
    });

    // Write the converted PDF file to the output path
    await writeFileAsync(outputPath, pdfBuf);
    return true;
  } catch (err) {
    console.error(`Error during PDF conversion: ${err.message}`);
    return false;
  }
};

export default {
  InitProduction
};

(async () => InitProduction())();
