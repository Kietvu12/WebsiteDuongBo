import React from "react";
import ex_pdf from '../../assets/img/pdf_filetype_icon.png';
import ex_jpg from '../../assets/img/jpg_filetype_icon.png';
import ex_doc from '../../assets/img/doc_filetype_icon.png';
import ex_xls from '../../assets/img/xls_filetype_icon.png';  
import ex_zip from '../../assets/img/zip_filetype_icon.png';
import ex_rar from '../../assets/img/rar_filetype_icon.png';
import ex_png from '../../assets/img/png_filetype_icon.png';

const svgMap = {
  pdf: (
    <img src={ex_pdf} alt="PDF File" className="w-10 h-10" />
  ),
  jpg: (
    <img src={ex_jpg} alt="JPG File" className="w-10 h-10" />
  ),
  png: (
    <img src={ex_png} alt="PNG File" className="w-10 h-10" />
  ),
  docx: (
    <img src={ex_doc} alt="DOCX File" className="w-10 h-10" />
  ),
  doc: (
    <img src={ex_doc} alt="DOC File" className="w-10 h-10" />
  ),
  xls: (
    <img src={ex_xls} alt="XLS File" className="w-10 h-10" />
  ),
  xlxs: (
    <img src={ex_xls} alt="XLSX File" className="w-10 h-10" />
  ),
  zip: (
    <img src={ex_zip} alt="ZIP File" className="w-10 h-10" />
  ),
  rar: (
    <img src={ex_rar} alt="RAR File" className="w-10 h-10" />
  ),
  default: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 w-8 h-8">
      <path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM14 3.5V9h5.5L14 3.5z" />
    </svg>
  ),
};

const FileIcon = ({ extension }) => {
  const key = extension.toLowerCase();
  return svgMap[key] || svgMap["default"];
};

export default FileIcon;
