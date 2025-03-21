import * as fs from "fs";
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import template_ondu from './Templates/ondu.template.latex.mjs';
import OutputFileSpecifications from '../utils/outputFileSpecs.utils.mjs';
import DocumentConfig from '../utils/documentConfig.latex.utils.mjs';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import outputFileSpecsUtils from "../utils/outputFileSpecs.utils.mjs";

dotenv.config();

console.log(process.env.SOURCE_PATH);
const source = process.env.SOURCE_PATH || './data/';
const outputDir = process.env.OUTPUT_DIR || './output/';

let fileName = "";
let fontSizeMultipler = 1;

const getJsonFiles = (sourcePath) => {
  let jsonFiles = [];

  // Check if the source path exists and is a directory
  if (fs.existsSync(sourcePath) && fs.statSync(sourcePath).isDirectory()) {
    // Read all files in the directory
    const files = fs.readdirSync(sourcePath);

    // Filter out non-JSON files and create an object with Name and path
    jsonFiles = files
      .filter(file => path.extname(file).toLowerCase() === '.json')
      .map(file => ({
        Name: path.basename(file, '.json'), // Name without .json extension
        path: `./${path.join(sourcePath, file)}` // Ensure the path starts with ./
      }));
  } else {
    console.error("Source path is not a valid directory or does not exist.");
  }
console.log(jsonFiles);
  return jsonFiles;
};

const InitProduction = async () => {

  const files = getJsonFiles(source);

  for(const item of files){

  if (!fs.existsSync(item.path)) {
    console.log("No file found in the data folder");
    return false; // Exit the function if the source file does not exist
  }
  var parsedJsonResume = JSON.parse(fs.readFileSync(item.path));

  parsedJsonResume = EscapeSpecialCharacers(parsedJsonResume);

  console.log(JSON.stringify(parsedJsonResume));

  fileName = item.Name;

  let pageCount = outputFileSpecsUtils.pageLimit+1;
  while (pageCount > outputFileSpecsUtils.pageLimit) {
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
  fontSizeMultipler = 1.0

}
cleanUpOutputDir();
return true;
}

const GenerateFiles = async (latexString) => {
  const texFileName = getTexFileName();
  try {
    fs.writeFileSync(texFileName, latexString);  // Save LaTeX string as .tex file

    // Compile the .tex file to PDF
    const isCompiled = await compileLatex(path.basename(texFileName));  // Pass the base name of the .tex file

    if (!isCompiled) {
      console.error("Failed to compile the LaTeX file to PDF.");
    }
  } catch (error) {
    console.error(`Error writing .tex file or compiling PDF: ${error.message}`);
  }

  return true;
};

const getPdfFileName = () => {
  return outputDir + fileName + ".pdf";
}

const getTexFileName = () => {
  return outputDir + fileName + ".tex";
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

const compileLatex = async (texFileName) => {
  const sourceTexPath = path.join(outputDir, texFileName);
  const outputPdfPath = path.join(outputDir, texFileName.replace('.tex', '.pdf'));

  // Ensure the .tex file exists
  if (!fs.existsSync(sourceTexPath)) {
    console.error(`TeX file not found: ${sourceTexPath}`);
    return false;
  }

  // console.log(`Compiling LaTeX file: ${sourceTexPath}`);

  // Spawn the LaTeX process using xelatex or pdflatex
  const latexProcess = spawn('xelatex', [texFileName], {
    cwd: outputDir,  // Use the output directory as the working directory
    stdio: ['ignore', 'pipe', 'pipe']  // Ignore stdin, pipe stdout and stderr
  });

  // Capture stdout (LaTeX process output)
  latexProcess.stdout.on('data', (data) => {
    // console.log(`Output: ${data.toString()}`);
  });

  // Capture stderr (LaTeX process errors)
  latexProcess.stderr.on('data', (data) => {
    console.error(`Error: ${data.toString()}`);
  });

  // Wait for the LaTeX process to finish
  return new Promise((resolve, reject) => {
    latexProcess.on('close', (code) => {
      if (code === 0) {
        // console.log(`LaTeX compilation successful! PDF generated at: ${outputPdfPath}`);
        resolve(true);
      } else {
        console.error(`LaTeX compilation failed with exit code ${code}`);
        reject(false);
      }
    });
  });
};

function escapeLatex(text) {
  const latexSpecialChars = {
      '{': '\\{',
      '}': '\\}',
      '%': '\\%',
      '$': '\\$',
      '_': '\\_',
      '&': '\\&',
      '#': '\\#',
      '^': '\\^',
      '~': '\\textasciitilde',
      '<': '\\textless',
      '>': '\\textgreater'
  };

  // Escape special LaTeX characters first
  text = text.replace(/([{}%$&_#^~<>])/g, match => latexSpecialChars[match]);

  // Convert **text** to \textbf{text} for LaTeX bold
  text = text.replace(/\*\*(.*?)\*\*/g, (_, match) => `\\textbf{${match}}`);

  return text;
}


function EscapeSpecialCharacers(data) {

  data.Name = escapeLatex(data.Name);
  data.Phone = escapeLatex(data.Phone);
  data.Email = escapeLatex(data.Email);  // Fixed: Correct field for email

  data.Links.forEach((element) => {
      element.Title = escapeLatex(element.Title);
  });

  data.Sections.forEach((item) => {
      // Section Header
      item.Title = escapeLatex(item.Title);

      item.Content.forEach((section) => {

          if (section.row1?.length > 0) { 
              section.row1 = section.row1.map(a => escapeLatex(a));  // Correctly updating array values
          }

          if (section.row2?.length > 0) {
              section.row2 = section.row2.map(a => escapeLatex(a));  // Correctly updating array values
          }

          if (section.description) {
              section.description.forEach((textDesc) => {
                  if (textDesc?.subTitle) {
                      textDesc.subTitle = escapeLatex(textDesc.subTitle);
                  }
                  if (textDesc?.text) {
                      textDesc.text = escapeLatex(textDesc.text);
                  }
              });
          }
      });
  });

  return data;
}

const cleanUpOutputDir = () => {
  const texDir = path.join(outputDir, 'tex');

  // Ensure the tex directory exists
  if (!fs.existsSync(texDir)) {
    fs.mkdirSync(texDir, { recursive: true });
  }

  // Get all files in the output directory
  const files = fs.readdirSync(outputDir);

  files.forEach((file) => {
    const filePath = path.join(outputDir, file);

    // Check if it's a file and not a directory
    if (fs.statSync(filePath).isFile()) {
      // Check if the file is neither a PDF nor a TeX file
      if (path.extname(file) !== '.pdf' && path.extname(file) !== '.tex') {
        // Delete the file
        fs.unlinkSync(filePath);
      } else if (path.extname(file) === '.tex') {
        // Move the TeX file to the tex directory
        const newFilePath = path.join(texDir, file);
        fs.renameSync(filePath, newFilePath);
      }
    }
  });

  console.log("Cleaned up output directory and moved .tex files to tex directory.");
};

export default {
  InitProduction
};

(async () => InitProduction())();
