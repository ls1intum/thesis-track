import { UploadFileType } from '../config/types'

export function getAdjustedFileType(filename: string, type: UploadFileType) {
  let adjustedType: UploadFileType = type

  if (filename.endsWith('.pdf')) {
    adjustedType = 'pdf'
  }

  if (
    filename.endsWith('.png') ||
    filename.endsWith('.jpg') ||
    filename.endsWith('.jpeg') ||
    filename.endsWith('.svg')
  ) {
    adjustedType = 'image'
  }

  return adjustedType
}
