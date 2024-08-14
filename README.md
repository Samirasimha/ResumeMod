
# Resume Conversion Tool

## Overview

The Resume Conversion Tool is a Node.js application designed to transform resumes from a JSON format into Docx and PDF files. The tool leverages `docx`, `pdf-lib`, and `awesome-unoconv` libraries to generate professional one-page resumes. It includes customizable templates and dynamically adjusts text sizes and margins to ensure that the content fits perfectly on a single page.

## Features

- **JSON to Docx/PDF Conversion:** Converts resumes from JSON format to Docx and PDF files.
- **Customizable Templates:** Supports customizable templates, allowing users to select fonts, text sizes, and layout options.
- **One-Page Optimization:** Ensures that all content fits within a single page by dynamically adjusting text sizes and margins.
- **Automated Document Generation:** Automatically generates headers, sections, and tables with metadata.
- **Cross-Format Export:** Exports resumes seamlessly in both Docx and PDF formats.

## Tech Stack

- **Node.js**: The primary runtime environment.
- **docx**: Used for creating and manipulating Docx files.
- **pdf-lib**: Used for counting pages and manipulating PDF files.
- **awesome-unoconv**: Utilized for converting Docx files to PDF format.
- **JavaScript**: The programming language used for development.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed. You can download it from [here](https://nodejs.org/).
- **LibreOffice**: LibreOffice must be installed because the `awesome-unoconv` library requires LibreOffice to perform the conversion from Docx to PDF. You can download and install LibreOffice from [here](https://www.libreoffice.org/download/download/).

  ### Installing LibreOffice:
  - **Windows/MacOS**: Download the installer from the link above and follow the installation instructions.
  - **Linux**: You can install LibreOffice using your package manager:
    ```bash
    sudo apt-get update
    sudo apt-get install libreoffice
    ```

## Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Samirasimha/ResumeMod.git
   cd ResumeMod
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   npm i nodemon
   ```

3. **Set Up Input Data:**
   - Prepare your resume data in a JSON format. Save your JSON file in the `./data` directory with the filename `MyResume.json`.

## Usage

1. **Run the Application:**
   ```bash
   nodemon
   ```

2. **Output Files:**
   - The generated Docx and PDF files will be saved in the `./output` directory.
   - The filenames will be automatically generated based on the name field in the JSON file.

## JSON Structure

The JSON file should follow this structure:

```json
{
  "Name": "John Doe",
  "Phone": "(123)-456-7890",
  "Email": "john.doe@example.com",
  "Links": [
    {
      "Title": "linkedin.com/in/johndoe",
      "Url": "linkedin.com/in/johndoe"
    },
    {
      "Title": "github.com/johndoe",
      "Url": "github.com/johndoe"
    }
  ],
  "Sections": [
    {
      "Title": "Skills",
      "Content": [
        {
          "description": [
            {
              "subTitle": "Languages",
              "text": "Python, JavaScript, Java, C++"
            },
            {
              "subTitle": "Technologies and Frameworks",
              "text": "React, Node.js, Django, SpringBoot"
            },
            {
              "subTitle": "Databases",
              "text": "MySQL, PostgreSQL, MongoDB"
            },
            {
              "subTitle": "Other Skills",
              "text": "AWS, Docker, CI/CD, REST APIs"
            }
          ]
        }
      ]
    },
    {
      "Title": "Experience",
      "Content": [
        {
          "row1": ["TechCorp", "January 2020 – July 2023"],
          "row2": ["Software Engineer", "San Francisco, CA, USA"],
          "description": [
            {
              "text": "Led the development of a scalable microservices architecture, reducing system downtime by 50%."
            },
            {
              "text": "Implemented a CI/CD pipeline, accelerating release cycles by 30%."
            },
            {
              "text": "Developed and maintained APIs with a focus on security and performance."
            }
          ]
        },
        {
          "row1": ["Web Solutions Inc.", "August 2018 – December 2019"],
          "row2": ["Junior Developer", "New York, NY, USA"],
          "description": [
            {
              "text": "Contributed to the development of client-facing web applications using React and Node.js."
            },
            {
              "text": "Collaborated with the design team to create user-friendly interfaces."
            },
            {
              "text": "Optimized database queries, improving application response times by 25%."
            }
          ]
        }
      ]
    },
    {
      "Title": "Education",
      "Content": [
        {
          "row1": ["University of Tech", "MS, Computer Science", "May 2020"],
          "row2": [],
          "description": []
        },
        {
          "row1": ["State University", "BS, Computer Science", "May 2018"],
          "row2": [],
          "description": []
        }
      ]
    },
    {
      "Title": "Projects",
      "Content": [
        {
          "row1": ["Project Management Tool", "January 2022 – April 2022"],
          "description": [
            {
              "text": "Developed a project management tool with React and Node.js, allowing teams to track and manage projects efficiently."
            },
            {
              "text": "Integrated with third-party APIs for enhanced functionality."
            }
          ]
        },
        {
          "row1": ["E-commerce Website", "August 2021 – December 2021"],
          "description": [
            {
              "text": "Built a full-stack e-commerce website using Django and React, featuring secure payment processing and user authentication."
            }
          ]
        }
      ]
    }
  ]
}
```

## Customization

### Fonts and Text Sizes

The tool allows customization of fonts, text sizes, and other layout parameters. Modify these settings in the `PageSpecifications` object in the `pageSpecification.utils.mjs` file.

### Templates

You can create and use your templates by modifying the sections generation logic in the `GenerateAllSections` function within the `enhanced_docxCreationService.mjs` file.

### Section Arrangement

The order of sections in the resume can be rearranged by modifying the order of the sections in the JSON file. The sections will appear in the final resume in the order they are listed in the Sections array.

## Error Handling

The application includes error handling to manage file creation and conversion processes. In case of an error, appropriate messages will be logged, and the process will attempt to continue where possible.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contribution

Contributions are welcome! Please feel free to submit a pull request or open an issue if you have suggestions or improvements.


## Upcoming Features

1. A frontend interface for importing existing resumes and mapping them to templates, along with an option for manual entry.
2. Integration with an LLM (Large Language Model) API for resume content analysis and fine-tuning suggestions.
3. Enhanced performance and customization through templates created with Overleaf.
4. Expansion of available templates for greater variety and flexibility.

## Contact

For any inquiries or issues, please contact `samirasimha.r@gmail.com`.

GitHub Repository: [ResumeMod](https://github.com/Samirasimha/ResumeMod)