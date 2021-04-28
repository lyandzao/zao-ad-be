export class CodeDTO {
  readonly app_id: string;
  readonly code_type: string;
  readonly shield: string; // encode
  readonly code_name: string;
}

export class UpdateCodeDTO {
  readonly _id: string;
  readonly shield: string; // encode
  readonly code_name: string;
}
