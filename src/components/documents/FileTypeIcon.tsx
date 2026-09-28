export type FileType = 'pdf'|'xlsx'|'doc';
const iconPath: Record<FileType,string> = {pdf:'/icons/pdf-grey.svg',xlsx:'/icons/xls-grey.svg',doc:'/icons/docx-grey.svg'};
export function FileTypeIcon({type}: {type: FileType}) { return <img className="file-type-icon" src={iconPath[type]} alt={`${type} file`}/>; }
