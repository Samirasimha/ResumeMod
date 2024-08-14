import * as fs from "fs";

import {
  Packer
} from "docx";
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import unoconv from 'awesome-unoconv';
import template_ondu from './Templates/ondu.template.mjs';

const outputDir = "./output/"
const source = './data/MyResume.json';
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
  while (pageCount > 1) {

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
    if (pageCount > 1) {
      console.log("Number of pages Exceeded.. Regenerating File.");
    }

    fontSizeMultipler -= 0.05;

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

export default {
  InitProduction
};

(async () => InitProduction())();
