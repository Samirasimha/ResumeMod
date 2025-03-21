
  import DocumentConfig from "../../utils/documentConfig.latex.utils.mjs";
  
  
  let fontSizeMultipler = 1;
  
  
  const GenerateDocument = async (data, fontSizeReduction) => {
    try {
      fontSizeMultipler = fontSizeReduction;
  
      let document = CreateDocumentWithMetadata();

      document+= AddFunctions();
  
      document += `\\begin{document}`;

      document += CreateHeader(data);
  
      document += GenerateAllSections(data);

      document += `\\end{document}`;
  
      return document;
  
    } catch (error) {
      console.log(error);
      return true;
    }
  };
  
  const GenerateAllSections = (data) => {
    let sections = "";
    data.Sections.forEach((item) => {

        //Section Header
     let sectionItem = '\n \n \\section{'+item.Title+'}';

  
      item.Content.forEach((section) => {
  
        let dataTable = '\n \n \\begin{MetaTable}';

        let hasTable = false;

        if (section.row1?.length > 0) { 
          dataTable += GenerateNewRow(section.row1, 1);
          hasTable = true;
        }
  
        if (section.row2?.length > 0) {
            dataTable += GenerateNewRow(section.row2, 2);
          hasTable = true;
        }
  
        if (hasTable) {
            dataTable += '\\end{MetaTable}';
            sectionItem += dataTable;
        }
  
  
        if (section?.description && section?.description.length > 0) {
            
            sectionItem += ' \n \n \\begin{bulltetPoints}';
          section.description.forEach((textDesc) => {

            let item = "\n \\item ";
            let hasItem = false;
            if (textDesc?.subTitle){
                item += addBoldText(textDesc.subTitle+": ");
                hasItem = true;
            }
            if (textDesc?.text) {
              // console.log(textDesc.text);
                item += textDesc.text;
                hasItem = true;
              }
            
              if(hasItem){
                
                sectionItem += item;
              }

          });
          sectionItem += '\\end{bulltetPoints} ';
        }
      });

      sections += sectionItem;
    });
  
    return sections;
  };
  
  const GenerateNewRow = (row, rowNum) => {
    let rowItem = '';
    if(rowNum == 1){
        rowItem += addBoldText(row[0]);
        if(row.length > 2){
            if(row[1].length > 0){
                rowItem += addBar() +  addItalicText(row[1]);
            }
            if(row[2].length > 0){
                rowItem += " & "  +  addBoldText(addItalicText(row[2]));
            }
        }
        else{
            if(row[1].length > 0){
                rowItem += " & "  +  addBoldText(addItalicText(row[1]));
            }
        }
    }
    else if(rowNum == 2){
        rowItem += addItalicText(row[0]);
        if(row[1].length > 0){
            rowItem += " & "  +  addItalicText(row[1]); 
        }
    }
    return rowItem+addLineBreak();
  }
    const addBoldText = (text) => {
        return "\\textbf{"+text+"}";
    }

    const addItalicText = (text) => {
        return "\\emph{"+text+"}";
    }

    const addLineBreak = ()=> {
        return "\\\\";
    }

  
  const CreateHeader = (data) => {
    let header = `{\\fontsize{\\NameFontSize}{0}\\selectfont
                \\centerline{\\textbf{\\MakeUppercase{`+data.Name+`}}}} \n`;
    header += `\\centerline{\\fontsize{\\contentSize}{\\contentSize}\\selectfont \n`;
    header += data.Phone+addBar();
    header += '\\href{mailto:'+data.Email+'}{'+data.Email+'} \n';

    data.Links.forEach((element) => {
        header += addBar() + '\\href{https://www.'+element.Url+'}{'+element.Title+'} \n';
      });
    
      header += "} \n"

    return header;
  };
  
  

  const AddFunctions = () => {
    const functions = `% Bullet Points Customisation

    % Section Header Config
    \\newcommand{\\sectionHeader}[1]{
        \\textbf{#1}
        \\hrule
    }

    \\NewEnviron{bulltetPoints}{
    \\vspace{1pt}
    \\fontsize{\\contentSize}{\\BulletLineSpacing}\\selectfont
      \\begin{itemize}[itemsep=0pt, topsep=1pt, left = 8pt]
        \\BODY
      \\end{itemize}
    }
    
    % Table Customisation
    \\NewEnviron{MetaTable}{
    \\vspace{1pt}
      \\fontsize{\\contentSize}{\\contentSize}\\selectfont
      \\begin{tabularx}{\\textwidth}{Xr}
        \\BODY
      \\end{tabularx}
      \\normalsize
    }
    
    \\titleformat{\\section}
      { \\vspace{-8pt}\\fontsize{\\SectionHeaderSize}{\\SectionHeaderSize}\\selectfont\\bfseries\\raggedright}
      {}{0em}{\\MakeUppercase}[\\color{black}\\titlerule \\vspace{-5pt}]`;
    
      return functions;

  }

  const CreateDocumentWithMetadata = () => {
    
    let headers = '\\documentclass{article}\n' +
    '\\usepackage{lmodern}\n' +
    '\\usepackage[utf8]{inputenc}\n' +
    '\\usepackage[T1]{fontenc}\n' +
    '\\usepackage{geometry}\n' +
    '\\usepackage{xcolor}\n' +
    '\\usepackage{tabularx}\n' +
    '\\usepackage{hyperref}\n' +
    '\\usepackage{fontspec}\n' +
    '\\usepackage{enumitem}\n' +
    '\\usepackage{environ}\n' +
    '\\usepackage{titlesec}\n' +
    '\\hypersetup{\n' +
    '    colorlinks=true,\n' +
    '    linkcolor=blue,\n' +
    '    urlcolor=blue\n }';

    headers = addVariables(headers);
    headers = addMargins(headers);
    headers = addFont(headers);

    return headers;
  };

  const addFont = (item) => {
    item += '\\setmainfont{'+DocumentConfig.font+'} \n';
    return item;
  }

  const addMargins = (item) => {

    item += '\\geometry{margin='+DocumentConfig.pageMargin+'in} \n'+
            '\\setlength{\\parskip}{'+DocumentConfig.pageMargin+'pt} \n'+
            '\\setlength{\\parindent}{-'+DocumentConfig.pageMargin+'pt} \n';
    return item;

  }

  const addVariables = (item) => {

    item += '\\newcommand{\\contentSize}{'+(DocumentConfig.fontSize.contentSize*fontSizeMultipler)+'pt} \n'+
            '\\newcommand{\\BulletLineSpacing}{'+DocumentConfig.bulletPointSpacing+'pt} \n'+
            '\\newcommand{\\SectionHeaderSize}{'+(DocumentConfig.fontSize.contentSize*1.05*fontSizeMultipler)+'pt} \n'+
            '\\newcommand{\\NameFontSize}{'+(DocumentConfig.fontSize.userNameSize*fontSizeMultipler)+'pt} \n';
    return item;

}

const addBar = () => {
    return " \\textbar{} "
}
  
  export default {
    GenerateDocument
  };