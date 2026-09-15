export type InvitationStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'EXHAUSTED'

export type FilePurpose = 'PERSONAL_PHOTO' | 'IDENTITY_DOCUMENT'

export type ValidationErrorCode =
  | 'INVALID_MIME'
  | 'FILE_TOO_LARGE'
  | 'INVALID_CHECKSUM'
  | 'WRONG_PURPOSE'

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: ValidationErrorCode }
