import docxCreationService from "../service/docxCreationService.mjs";

const CreateDocx = async (req,res) => {
  await docxCreationService.InitProduction();
  return res.json({ Status: "Success" });};

export default {
  CreateDocx,
};
